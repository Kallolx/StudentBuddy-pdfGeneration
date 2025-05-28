import { Buffer } from 'buffer';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Image, FlatList, TextInput, Platform, InteractionManager } from 'react-native';
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
import generateCoverHTML from '../templates/ModernTemplate';
import { PDFDocument } from 'pdf-lib';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCredits } from '../context/CreditsContext';

const { width, height } = Dimensions.get('window');

const TEMPLATE_IMAGES = [
  { 
    id: 1, 
    image: require('../assets/templates/preview.png'), 
    name: 'Classic',
    color: '#333'
  },
  { 
    id: 2, 
    image: require('../assets/templates/preview2.png'), 
    name: 'Modern',
    color: '#333'
  },
  { 
    id: 3, 
    image: require('../assets/templates/preview3.png'), 
    name: 'Minimalist',
    color: '#333'
  },
  { 
    id: 4, 
    image: require('../assets/templates/preview.png'), 
    name: 'Academic',
    color: '#333'
  }
];

const AssignmentScreen = () => {
  const { goBack, navigateToScreen } = useNavigation();
  const insets = useSafeAreaInsets();
  const { credits, useCredit } = useCredits();
  const [pdfFile, setPdfFile] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showFormWithoutFile, setShowFormWithoutFile] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Memoize the entire form state to prevent re-renders
  const formDataRef = useRef({
    courseTitle: '',
    courseCode: '',
    assignmentNo: '',
    studentName: '',
    studentId: '',
    intake: '',
    section: '',
    program: '',
    instructorName: '',
    department: '',
    submissionDate: '',
  });
  
  // Expose a React state for components that need it
  const [formData, setFormData] = useState(formDataRef.current);
  
  // tab state
  const [activeTab, setActiveTab] = useState('course'); // 'course', 'student', 'instructor'
  
  const [generatedPdfUri, setGeneratedPdfUri] = useState(null);
  const [showActions, setShowActions] = useState(false);
  
  // Handle form input change
  const handleChange = (field, value) => {

    formDataRef.current[field] = value;
    if (Platform.OS !== 'android') {
      setFormData({...formDataRef.current});
    }
  };
  
  // Function to get form data for submission - critical for Android
  const getFormDataForSubmission = () => {
    // Return the current data from the ref, not the state
    return formDataRef.current;
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
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(result.assets[0].uri);
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      
      if (fileSizeMB > 10) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        setLoading(false);
        return;
      }
      
      setPdfFile(result.assets[0]);
      setFileSize(fileSizeMB.toFixed(2));
      setLoading(false);
    } catch (error) {
      console.log('Error picking document:', error);
      setLoading(false);
      alert('Error picking document. Please try again.');
    }
  };

  // Function to remove the uploaded PDF
  const removePdf = () => {
    setPdfFile(null);
    setFileSize(0);
  };
  
  // Function to generate cover - use the ref data directly
  const generateCover = async () => {
    // Get current form data from ref
    const currentFormData = getFormDataForSubmission();
    
    if (credits <= 0) {
      Alert.alert(
        "No Credits Available",
        "You don't have enough credits to generate a cover page. Complete tasks to earn more credits!",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Validate form data using the ref data
    const requiredFields = ['courseTitle', 'courseCode', 'studentName', 'studentId'];
    const missingFields = requiredFields.filter(field => !currentFormData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields marked with *",
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

      // Map template index to template type
      const templateTypes = ['classic', 'modern', 'minimalist', 'academic'];
      const templateType = templateTypes[selectedTemplate - 1] || 'classic';
      
      // Generate cover page HTML using ref data
      const coverType = 'assignment';
      const coverHTML = generateCoverHTML(currentFormData, coverType, templateType);

      // Get the first 3 letters of student name
      const studentNamePrefix = currentFormData.studentName.substring(0, 3).toUpperCase();
      const finalFileName = `${studentNamePrefix}-${currentFormData.studentId}.pdf`;
      const finalFilePath = `${FileSystem.documentDirectory}${finalFileName}`;
      
      // First, generate the cover page PDF
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
      
      // Set the PDF URI to the final merged file
      setGeneratedPdfUri(finalFilePath);
      setShowActions(true);
      setGeneratingCover(false);
      
      Alert.alert(
        "Success",
        pdfFile ? "Your document is ready!" : "Your cover page is ready!",
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

  // Function to download the PDF
  const downloadPdf = async () => {
    if (!generatedPdfUri) return;
    
    try {
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // Share the file (which allows saving)
        await Sharing.shareAsync(generatedPdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Cover Page',
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
        // For iOS, use Sharing.shareAsync with UTI
        await Sharing.shareAsync(generatedPdfUri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf'
        });
      } else if (Platform.OS === 'android') {
        // For Android, use IntentLauncher
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
  const CompletelyUncontrolledInput = ({ label, initialValue, onChangeText, placeholder, icon, required = false, keyboardType = 'default' }) => {
    // Input ref for direct manipulation
    const inputRef = useRef(null);
    
    // On mount only, set the initial value if provided
    useEffect(() => {
      // This runs only once to set initial value
      if (inputRef.current && initialValue) {
        inputRef.current.setNativeProps({ text: initialValue });
      }
    }, []);
    
    return (
      <View style={styles.inputContainer}>
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
      </View>
    );
  };

  // Date picker handlers
  const onChangeDatePicker = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    
    // Format date as MM/DD/YYYY
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    
    // Update the form data
    formDataRef.current.submissionDate = formattedDate;
    
    // For iOS, update the state to reflect changes immediately
    if (Platform.OS !== 'android') {
      setFormData({...formDataRef.current});
    }
  };

  // Modified FormSection component with tabs
  const FormSection = ({ formData, handleChange, selectedTemplate, setSelectedTemplate, generateCover, generatingCover }) => (
    <View style={styles.formContainer}>
      {/* Template Selector */}
      <View style={styles.templateSelectorContainer}>
        <Text style={styles.templateSelectorTitle}>Choose a Template</Text>
        <FlatList
          data={TEMPLATE_IMAGES}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.templateItem, 
                selectedTemplate === item.id && { borderColor: '#555', borderWidth: 2 }
              ]}
              onPress={() => setSelectedTemplate(item.id)}
            >
              <Image 
                source={item.image} 
                style={styles.templateImage}
                resizeMode="cover"
              />
              <View style={[styles.templateNameContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                <Text style={styles.templateName}>{item.name}</Text>
              </View>
              {selectedTemplate === item.id && (
                <View style={[styles.templateSelectedBadge, { backgroundColor: '#333' }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateList}
        />
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'course' && styles.activeTab]}
          onPress={() => setActiveTab('course')}
        >
          <Ionicons 
            name="book" 
            size={22} 
            color={activeTab === 'course' ? '#FFF' : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'course' && styles.activeTabText]}>
            Course
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'student' && styles.activeTab]}
          onPress={() => setActiveTab('student')}
        >
          <Ionicons 
            name="person" 
            size={22} 
            color={activeTab === 'student' ? '#FFF' : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'student' && styles.activeTabText]}>
            Student
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'instructor' && styles.activeTab]}
          onPress={() => setActiveTab('instructor')}
        >
          <Ionicons 
            name="school" 
            size={22} 
            color={activeTab === 'instructor' ? '#FFF' : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'instructor' && styles.activeTabText]}>
            Instructor
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content - Course Info */}
      {activeTab === 'course' && (
        <View style={styles.formContent}>
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
            label="Assignment Number"
            initialValue={formData.assignmentNo}
            onChangeText={(text) => handleChange('assignmentNo', text)}
            icon="create-outline"
            keyboardType="number-pad"
          />
        </View>
      )}
      
      {/* Tab Content - Student Info */}
      {activeTab === 'student' && (
        <View style={styles.formContent}>
          <CompletelyUncontrolledInput
            label="Student Name"
            initialValue={formData.studentName}
            onChangeText={(text) => handleChange('studentName', text)}
            icon="person-outline"
            required
          />
          
          <CompletelyUncontrolledInput
            label="Student ID"
            initialValue={formData.studentId}
            onChangeText={(text) => handleChange('studentId', text)}
            icon="card-outline"
            required
          />
          
          <CompletelyUncontrolledInput
            label="Intake"
            initialValue={formData.intake}
            onChangeText={(text) => handleChange('intake', text)}
            icon="calendar-outline"
          />
          
          <CompletelyUncontrolledInput
            label="Section"
            initialValue={formData.section}
            onChangeText={(text) => handleChange('section', text)}
            icon="albums-outline"
          />
          
          <CompletelyUncontrolledInput
            label="Program/Department"
            initialValue={formData.program}
            onChangeText={(text) => handleChange('program', text)}
            icon="school-outline"
          />
        </View>
      )}
      
      {/* Tab Content - Instructor Info */}
      {activeTab === 'instructor' && (
        <View style={styles.formContent}>
          <CompletelyUncontrolledInput
            label="Instructor Name"
            initialValue={formData.instructorName}
            onChangeText={(text) => handleChange('instructorName', text)}
            icon="person-outline"
          />
          
          <CompletelyUncontrolledInput
            label="Department"
            initialValue={formData.department}
            onChangeText={(text) => handleChange('department', text)}
            icon="business-outline"
          />
          
          {/* Date Picker for Submission Date */}
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
              <Text style={[
                styles.textInput, 
                styles.textInputWithIcon, 
                !formDataRef.current.submissionDate && {color: '#666'}
              ]}>
                {formDataRef.current.submissionDate || 'Submission Date'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDatePicker}
            />
          )}
        </View>
      )}
      
      {/* Tab Navigation Buttons */}
      <View style={styles.tabNavigationButtons}>
        {activeTab !== 'course' && (
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => setActiveTab(activeTab === 'student' ? 'course' : 'student')}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        {activeTab !== 'instructor' && (
          <TouchableOpacity 
            style={[styles.navButton, styles.navButtonNext]}
            onPress={() => setActiveTab(activeTab === 'course' ? 'student' : 'instructor')}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
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

  const handleGenerate = async () => {
    if (!formData.courseTitle || !formData.courseCode || !formData.studentName || !formData.studentId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (credits <= 0) {
      Alert.alert(
        'No Credits Available',
        'You have used all your daily credits. Please try again tomorrow or buy more credits.',
        [
          { text: 'Buy Credits', onPress: () => navigateToScreen('Settings') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    const success = await useCredit();
    if (success) {
      generateCover();
    } else {
      Alert.alert('Error', 'Failed to use credit. Please try again.');
    }
  };

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
        <Text style={styles.headerTitle}>Create Assignment</Text>
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
                {/* File Info */}
                <View style={styles.fileDetails}>
                  <Ionicons name="document-text" size={24} color="#FFF" style={styles.fileIcon} />
                  <View style={styles.fileTextContainer}>
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {pdfFile.name}
                    </Text>
                    <Text style={styles.fileSize}>{fileSize} MB</Text>
                  </View>
                  
                  {/* Remove button */}
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={removePdf}
                  >
                    <Ionicons name="trash-outline" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
                
                {/* Success message */}
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
                      {loading ? 'Processing...' : 'Upload Assignment PDF'}
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
              
              {/* Option to continue without file */}
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

        {/* Input fields - displayed when a file is uploaded OR user chooses to continue without file */}
        {(pdfFile || showFormWithoutFile) && <FormSection formData={formData} handleChange={handleChange} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} generateCover={generateCover} generatingCover={generatingCover} />}
        
        {/* PDF Action Buttons */}
        {showActions && generatedPdfUri && (
          <View style={styles.pdfActionsContainer}>
            <Text style={styles.pdfActionsTitle}>Your cover page is ready!</Text>
            
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
  // Compact header styles (replacing heroSection)
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactHeaderIcon: {
    marginRight: 12,
  },
  compactTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  compactDescription: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#AAAAAA',
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
    height: 240, // Reduced height
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  uploadBlur: {
    flex: 1,
    padding: 16, // Reduced padding
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.3)',
  },
  uploadContentWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16, // Reduced padding
  },
  uploadIconContainer: {
    width: 60, // Smaller icon
    height: 60, // Smaller icon
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
  },
  uploadTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8, // Less space
  },
  uploadDescription: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#BBBBBB',
    marginBottom: 16, // Reduced margin
    textAlign: 'center',
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8, // Reduced margin
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
    marginTop: 8, // Reduced margin
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
  },
  continueWithoutFileText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginRight: 6,
  },
  
  // File info (compact version)
  fileInfoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8, // Reduced margin
  },
  fileInfoGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14, // Reduced padding
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
    marginTop: 12, // Reduced margin
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8, // Reduced padding
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
    marginTop: 12, // Reduced margin
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 12, // Reduced margin
    marginTop: 16, // Reduced margin
    paddingLeft: 4,
  },
  
  // Form content
  formContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 16, // Reduced padding
    marginBottom: 12, // Reduced margin
    gap: 12, // Reduced gap
  },
  
  // Input fields
  inputContainer: {
    marginBottom: 12, // Reduced margin
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    minHeight: 46,
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
  requiredStar: {
    color: '#825EFF',
  },
  
  // Generate Button
  generateButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  generateButton: {
    borderRadius: 30, // More rounded
    overflow: 'hidden',
    width: width * 0.6, // Less width
    marginBottom: 12, // Reduced margin
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
  
  // Template selector styles
  templateSelectorContainer: {
    marginBottom: 16, // Reduced margin
  },
  templateSelectorTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8, // Reduced margin
  },
  templateList: {
    paddingVertical: 8,
  },
  templateItem: {
    width: 120,
    height: 160, // Reduced height
    marginRight: 10, // Reduced margin
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  templateSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  noFieldsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
  },
  
  // Tab styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16, // Reduced margin
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#888',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  
  // Tab Navigation Buttons
  tabNavigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20, // Reduced margin
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  navButtonNext: {
    marginLeft: 'auto',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginHorizontal: 6,
  },

  // PDF Action styles
  pdfActionsContainer: {
    marginTop: 16, // Reduced margin
    padding: 16, // Reduced padding
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
    marginBottom: 12, // Reduced margin
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

export default AssignmentScreen; 