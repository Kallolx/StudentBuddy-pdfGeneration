import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Image, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '../context/NavigationContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as IntentLauncher from 'expo-intent-launcher';
import generateGroupReportHTML from '../templates/GroupReportTemplate';
import { PDFDocument } from 'pdf-lib';
import { Buffer } from 'buffer';
import { useCredits } from '../context/CreditsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GroupReportScreen = () => {
  const { goBack, navigateToScreen } = useNavigation();
  const insets = useSafeAreaInsets();
  const { credits, useCredit } = useCredits();
  const [pdfFile, setPdfFile] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showFormWithoutFile, setShowFormWithoutFile] = useState(false);
  
  // Memoize the entire form state to prevent re-renders
  const formDataRef = useRef({
    courseTitle: '',
    courseCode: '',
    experimentName: '',
    students: [], // Array of { name, id }
  });
  
  // Expose a React state for components that need it
  const [formData, setFormData] = useState(formDataRef.current);
  
  const [generatedPdfUri, setGeneratedPdfUri] = useState(null);
  const [showActions, setShowActions] = useState(false);
  
  // Handle form input change
  const handleChange = (field, value) => {
    formDataRef.current[field] = value;
    if (Platform.OS !== 'android') {
      setFormData({...formDataRef.current});
    }
  };
  
  // Handle student data change
  const handleStudentChange = (index, field, value) => {
    const updatedStudents = [...formDataRef.current.students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value
    };
    formDataRef.current.students = updatedStudents;
    if (Platform.OS !== 'android') {
      setFormData({...formDataRef.current});
    }
  };
  
  // Add new student
  const addStudent = () => {
    if (formDataRef.current.students.length >= 5) {
      Alert.alert('Maximum Limit', 'You can add up to 5 students only.');
      return;
    }
    
    const updatedStudents = [...formDataRef.current.students, { name: '', id: '' }];
    formDataRef.current.students = updatedStudents;
    setFormData({...formDataRef.current}); // Always update state to trigger re-render
  };
  
  // Remove student
  const removeStudent = (index) => {
    const updatedStudents = formDataRef.current.students.filter((_, i) => i !== index);
    formDataRef.current.students = updatedStudents;
    setFormData({...formDataRef.current}); // Always update state to trigger re-render
  };
  
  // Function to pick PDF document
  const pickDocument = async () => {
    try {
      setLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        setLoading(false);
        return;
      }
      
      const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      
      if (fileSizeMB > 10) {
        Alert.alert('Error', 'File size exceeds 10MB limit. Please choose a smaller file.');
        setLoading(false);
        return;
      }
      
      setPdfFile(result.assets[0]);
      setFileSize(fileSizeMB.toFixed(2));
      setLoading(false);
    } catch (error) {
      console.log('Error picking document:', error);
      setLoading(false);
      Alert.alert('Error', 'Error picking document. Please try again.');
    }
  };

  // Function to remove the uploaded PDF
  const removePdf = () => {
    setPdfFile(null);
    setFileSize(0);
  };
  
  // Function to generate cover
  const generateCover = async () => {
    const currentFormData = getFormDataForSubmission();
    
    if (credits <= 0) {
      Alert.alert(
        "No Credits Available",
        "You don't have enough credits to generate a cover page. Complete tasks to earn more credits!",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Validate form data
    const requiredFields = ['courseTitle', 'courseCode', 'experimentName'];
    const missingFields = requiredFields.filter(field => !currentFormData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields marked with *",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Validate students
    if (currentFormData.students.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please add at least one student",
        [{ text: "OK" }]
      );
      return;
    }
    
    const invalidStudents = currentFormData.students.some(student => !student.name || !student.id);
    if (invalidStudents) {
      Alert.alert(
        "Missing Information",
        "Please fill in all student information",
        [{ text: "OK" }]
      );
      return;
    }
    
    setGeneratingCover(true);
    
    try {
      // Use a credit before generating
      const success = await useCredit();
      if (!success) {
        throw new Error('Failed to use credit');
      }

      // Generate cover page HTML
      const coverHTML = generateGroupReportHTML(currentFormData);

      const studentNamesPrefix = currentFormData.students
        .map(student => student.name.substring(0, 3).toUpperCase())
        .join('-');
      const finalFileName = `${studentNamesPrefix}-GROUP-LAB.pdf`;
      const finalFilePath = `${FileSystem.documentDirectory}${finalFileName}`;
      
      // Generate the cover page PDF
      const { uri: coverUri } = await Print.printToFileAsync({
        html: coverHTML,
        base64: false
      });

      if (pdfFile) {
        // Read the cover page PDF
        const coverPdfBytes = await FileSystem.readAsStringAsync(coverUri, { encoding: 'base64' });
        const coverPdfDoc = await PDFDocument.load(Buffer.from(coverPdfBytes, 'base64'));

        // Read the uploaded PDF
        const uploadedPdfBytes = await FileSystem.readAsStringAsync(pdfFile.uri, { encoding: 'base64' });
        const uploadedPdfDoc = await PDFDocument.load(Buffer.from(uploadedPdfBytes, 'base64'));

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        // Copy pages from cover PDF
        const coverPages = await mergedPdf.copyPages(coverPdfDoc, coverPdfDoc.getPageIndices());
        coverPages.forEach((page) => mergedPdf.addPage(page));

        // Copy pages from uploaded PDF
        const uploadedPages = await mergedPdf.copyPages(uploadedPdfDoc, uploadedPdfDoc.getPageIndices());
        uploadedPages.forEach((page) => mergedPdf.addPage(page));

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const mergedPdfBase64 = Buffer.from(mergedPdfBytes).toString('base64');

        // Write the merged PDF to file
        await FileSystem.writeAsStringAsync(finalFilePath, mergedPdfBase64, { encoding: 'base64' });

        // Clean up temporary files
        await FileSystem.deleteAsync(coverUri, { idempotent: true });
      } else {
        // If no uploaded PDF, just use the cover page
        await FileSystem.copyAsync({
          from: coverUri,
          to: finalFilePath
        });
        await FileSystem.deleteAsync(coverUri, { idempotent: true });
      }
      
      setGeneratedPdfUri(finalFilePath);
      setShowActions(true);
      setGeneratingCover(false);
      
      Alert.alert(
        "Success",
        pdfFile ? "Your group lab report is ready!" : "Your group lab report cover is ready!",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error("Error generating document:", error);
      Alert.alert(
        "Error",
        "Failed to generate document. Please try again.",
        [{ text: "OK" }]
      );
      setGeneratingCover(false);
    }
  };

  // Function to get form data for submission
  const getFormDataForSubmission = () => {
    return formDataRef.current;
  };

  // Function to download the PDF
  const downloadPdf = async () => {
    if (!generatedPdfUri) return;
    
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(generatedPdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Group Lab Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      Alert.alert("Error", "Failed to download the PDF.");
    }
  };

  // Function to open the PDF
  const openPdf = async () => {
    if (!generatedPdfUri) return;
    
    try {
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(generatedPdfUri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        });
      } else if (Platform.OS === 'android') {
        const cUri = await FileSystem.getContentUriAsync(generatedPdfUri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          flags: 1,
          type: 'application/pdf'
        });
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      Alert.alert("Error", "Failed to open the PDF.");
    }
  };

  // Create a truly uncontrolled input for Android
  const CompletelyUncontrolledInput = ({ label, initialValue, onChangeText, icon, required = false, keyboardType = 'default' }) => {
    const inputRef = useRef(null);
    
    useEffect(() => {
      if (inputRef.current && initialValue) {
        inputRef.current.setNativeProps({ text: initialValue });
      }
    }, []);
    
    return (
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          ref={inputRef}
          style={[styles.textInput, styles.textInputWithIcon]}
          placeholderTextColor="#666"
          placeholder={label + (required ? ' *' : '')}
          defaultValue={initialValue}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          // Android specific props
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
          disableFullscreenUI={true}
          caretHidden={false}
          rejectResponderTermination={true}
          selectTextOnFocus={false}
          // Avoid most automatic input behavior
          spellCheck={false}
          autoComplete="off"
          blurOnSubmit={false}
        />
      </View>
    );
  };

  // Student Input Component
  const StudentInput = ({ index, student, onRemove }) => (
    <View style={styles.studentInputContainer}>
      <View style={styles.studentInputHeader}>
        <Text style={styles.studentInputTitle}>Student {index + 1}</Text>
        {index > 0 && (
          <TouchableOpacity 
            style={styles.removeStudentButton}
            onPress={() => onRemove(index)}
          >
            <Ionicons name="close-circle" size={24} color="#FF4444" />
          </TouchableOpacity>
        )}
      </View>
      
      <CompletelyUncontrolledInput
        label="Student Name"
        initialValue={student.name}
        onChangeText={(text) => handleStudentChange(index, 'name', text)}
        icon="person-outline"
        required
      />
      
      <CompletelyUncontrolledInput
        label="Student ID"
        initialValue={student.id}
        onChangeText={(text) => handleStudentChange(index, 'id', text)}
        icon="card-outline"
        required
      />
    </View>
  );

  const FormSection = ({ formData, handleChange, selectedTemplate, setSelectedTemplate, generateCover, generatingCover }) => (
    <View style={styles.formContainer}>
      {/* Course Info */}
      <View style={styles.formContent}>
        <Text style={styles.formTitle}>Course & Project Information</Text>
        
        <CompletelyUncontrolledInput
          label="Course Title"
          initialValue={formData.courseTitle}
          onChangeText={(text) => handleChange('courseTitle', text)}
          icon="book-outline"
          required
        />
        
        <CompletelyUncontrolledInput
          label="Course Code"
          initialValue={formData.courseCode}
          onChangeText={(text) => handleChange('courseCode', text)}
          icon="code-outline"
          required
        />
        
        
        <CompletelyUncontrolledInput
          label="Project Name"
          initialValue={formData.experimentName}
          onChangeText={(text) => handleChange('experimentName', text)}
          icon="create-outline"
          required
        />
      </View>
      
      {/* Students Section */}
      <View style={styles.formContent}>
        <View style={styles.studentsHeader}>
          <Text style={styles.formTitle}>Group Members</Text>
          {formData.students.length < 5 && (
            <TouchableOpacity 
              style={styles.addStudentButton}
              onPress={addStudent}
            >
              <Ionicons name="add-circle" size={24} color="#825EFF" />
              <Text style={styles.addStudentText}>Add Student</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {formData.students.map((student, index) => (
          <StudentInput
            key={index}
            index={index}
            student={student}
            onRemove={removeStudent}
          />
        ))}
        
        {formData.students.length === 0 && (
          <TouchableOpacity 
            style={styles.emptyStudentsContainer}
            onPress={addStudent}
          >
            <Ionicons name="add-circle-outline" size={40} color="#825EFF" />
            <Text style={styles.emptyStudentsText}>Add Group Members</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Generate Cover Button */}
      <View style={styles.generateButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.generateButton, 
            (credits <= 0 || generatingCover) && styles.generateButtonDisabled
          ]}
          onPress={generateCover}
          disabled={credits <= 0 || generatingCover}
        >
          <View style={styles.generateButtonGradient}>
            <Text style={styles.generateButtonText}>
              {generatingCover ? 'Generating...' : 'Generate Cover'}
            </Text>
            {!generatingCover ? (
              <Ionicons name="layers" size={20} color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.spinIcon} />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Credits counter as text */}
        <Text style={styles.usageText}>
          Available Credits: <Text style={styles.usageCount}>{credits}</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Platform.OS === 'android' 
          ? {paddingBottom: 100} 
          : {paddingBottom: 80}
        }
        removeClippedSubviews={false}
      >
        {/* File upload section */}
        <View style={styles.uploadContainer}>
          {pdfFile ? (
            // Compact file info when file is uploaded
            <View style={styles.fileInfoContainer}>
              <LinearGradient
                colors={['rgba(130, 94, 255, 0.1)', 'rgba(130, 94, 255, 0.05)']}
                style={styles.fileInfoGradient}
              >
                <View style={styles.fileDetails}>
                  <Ionicons name="document-text" size={24} color="#FFF" style={styles.fileIcon} />
                  <View style={styles.fileTextContainer}>
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {pdfFile.name}
                    </Text>
                    <Text style={styles.fileSize}>{fileSize} MB</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={removePdf}
                  >
                    <Ionicons name="trash-outline" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.successText}>Document uploaded successfully</Text>
                </View>
              </LinearGradient>
            </View>
          ) : (
            // Upload area when no file
            <View style={styles.uploadOuterContainer}>
              <TouchableOpacity 
                style={styles.uploadArea} 
                onPress={pickDocument}
                disabled={loading}
              >
                <BlurView intensity={20} tint="dark" style={styles.uploadBlur}>
                  <View style={styles.uploadContentWrapper}>
                    <View style={styles.uploadIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={40} color="#FFF" />
                    </View>
                    <Text style={styles.uploadTitle}>
                      {loading ? 'Processing...' : 'Upload Group Report PDF'}
                    </Text>
                    <Text style={styles.uploadDescription}>
                      Tap to browse files (max 10MB)
                    </Text>
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={pickDocument}
                      disabled={loading}
                    >
                      <View style={styles.uploadButtonGradient}>
                        <Text style={styles.uploadButtonText}>Choose File</Text>
                        <Ionicons name="document-outline" size={18} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.continueWithoutFileButton}
                onPress={() => setShowFormWithoutFile(!showFormWithoutFile)}
              >
                <Text style={styles.continueWithoutFileText}>
                  {showFormWithoutFile ? 'Hide Details Form' : 'Continue without PDF upload'}
                </Text>
                <Ionicons 
                  name={showFormWithoutFile ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#825EFF" 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Form section */}
        {(pdfFile || showFormWithoutFile) && (
          <FormSection 
            formData={formData} 
            handleChange={handleChange} 
            generateCover={generateCover} 
            generatingCover={generatingCover} 
          />
        )}
        
        {/* PDF Action Buttons */}
        {showActions && generatedPdfUri && (
          <View style={styles.pdfActionsContainer}>
            <Text style={styles.pdfActionsTitle}>Your group lab report is ready!</Text>
            
            <View style={styles.pdfActionsButtons}>
              <TouchableOpacity 
                style={[styles.pdfActionButton, styles.downloadButton]} 
                onPress={downloadPdf}
              >
                <Ionicons name="download-outline" size={22} color="#FFFFFF" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pdfActionButton, styles.openButton]} 
                onPress={openPdf}
              >
                <Ionicons name="eye-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Upload section
  uploadContainer: {
    marginBottom: 16,
  },
  uploadOuterContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  uploadArea: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  uploadBlur: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.3)',
  },
  uploadContentWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#BBBBBB',
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  uploadButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    marginRight: 8,
  },
  // Continue without file button
  continueWithoutFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
  },
  continueWithoutFileText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginRight: 6,
  },
  // File info
  fileInfoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fileInfoGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 12,
    color: '#FFF',
  },
  fileTextContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
    marginTop: 4,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#FFF',
  },
  // Form styles
  formContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  formContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  // Input fields
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    minHeight: 46,
    marginBottom: 12,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    height: 46,
  },
  textInputWithIcon: {
    paddingLeft: 0,
  },
  // Students section
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(130, 94, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addStudentText: {
    color: '#825EFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginLeft: 4,
  },
  studentInputContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  studentInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInputTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
  },
  removeStudentButton: {
    padding: 4,
  },
  emptyStudentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(40, 40, 40, 0.5)',
    borderRadius: 12,
  },
  emptyStudentsText: {
    color: '#825EFF',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    marginTop: 8,
  },
  // Generate Button
  generateButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  generateButton: {
    borderRadius: 30,
    overflow: 'hidden',
    width: width * 0.6,
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    marginRight: 8,
  },
  spinIcon: {
    transform: [{ rotate: '45deg' }],
  },
  // Usage text
  usageText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },
  usageCount: {
    color: '#FFF',
    fontFamily: 'DMSans-Medium',
  },
  // PDF Action styles
  pdfActionsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  pdfActionsTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  pdfActionsButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  pdfActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(130, 94, 255, 0.3)',
    width: '80%',
  },
  openButton: {
    backgroundColor: '#52B6FF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginLeft: 8,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
});

export default GroupReportScreen; 