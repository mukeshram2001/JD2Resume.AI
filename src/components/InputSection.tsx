import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Briefcase, Sparkles, CheckCircle } from 'lucide-react';
import { extractTextFromFile } from '@/lib/parsers';
import ModernCard from './ui/ModernCard';
import { Textarea } from './ui/textarea';

interface InputSectionProps {
  onAnalyze: (resumeText: string, jobDescText: string) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  // Global error handler for file processing
  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error in InputSection:', event.error);
      event.preventDefault();
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in InputSection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);
  const [resumeText, setResumeText] = useState('');
  const [jobDescText, setJobDescText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    console.log('🔒 FILE SELECT STARTED - PROTECING PAGE');

    // Immediate protection - set status and lock browsers
    setIsFilePickerOpen(true);

    let isProtectionActive = true;

    // MULTIPLE LAYER PROTECTION SYSTEM
    const protections = {
      // Layer 1: Block all navigation attempts
      beforeUnload: (e: BeforeUnloadEvent) => {
        console.log('🚫 Blocking navigation attempt during file selection');
        e.preventDefault();
        e.returnValue = 'Selecting file, please wait...';
        if (isProtectionActive) return e.returnValue;
      },

      // Layer 2: Catch actual unload events
      unload: (e: Event) => {
        console.log('🚫 Blocking actual page unload during file selection');
        if (isProtectionActive) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return false;
        }
      },

      // Layer 3: Handle visibility changes (background/foreground)
      visibility: () => {
        if (document.visibilityState === 'visible' && isProtectionActive) {
          console.log('📱 Page visible - user returned from file picker');
          // Keep protection active until file is actually selected
          setTimeout(cleanupProtections, 1000); // Give time for file selection
        } else {
          console.log('📱 Page hidden - user in file system');
        }
      },

      // Layer 4: Prevent mobile browser cache/memory cleanup
      pageHide: () => {
        console.log('📱 Page hide - protecting against mobile browser cleanup');
      },

      // Layer 5: Handle when app becomes visible again
      pageShow: () => {
        console.log('📱 Page show - mobile browser restored');
      }
    };

    // ACTIVATE ALL PROTECTION LAYERS
    window.addEventListener('beforeunload', protections.beforeUnload, { capture: true });
    window.addEventListener('unload', protections.unload, { capture: true });
    document.addEventListener('visibilitychange', protections.visibility);
    window.addEventListener('pagehide', protections.pageHide);
    window.addEventListener('pageshow', protections.pageShow);

    // Clean up function
    const cleanupProtections = () => {
      if (isProtectionActive) {
        console.log('🧹 Cleaning up file selection protections');
        isProtectionActive = false;
        setIsFilePickerOpen(false);

        window.removeEventListener('beforeunload', protections.beforeUnload);
        window.removeEventListener('unload', protections.unload);
        document.removeEventListener('visibilitychange', protections.visibility);
        window.removeEventListener('pagehide', protections.pageHide);
        window.removeEventListener('pageshow', protections.pageShow);
      }
    };

    // EXECUTE FILE PICKER
    if (fileInputRef.current) {
      console.log('📁 Opening file picker...');

      // Add a timeout for protection cleanup
      const protectionTimeout = setTimeout(() => {
        console.log('⏰ File picker timeout - cleaning up (5min limit)');
        cleanupProtections();
      }, 300000); // 5 minutes

      try {
        fileInputRef.current.click();
        console.log('✅ File picker opened successfully - PAGE PROTECTED');
      } catch (error) {
        console.error('❌ File picker failed:', error);
        cleanupProtections();
        return;
      }
    } else {
      console.error('❌ File input not found');
      cleanupProtections();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setParseError(null);
      setIsParsingFile(true);

      try {
        console.log('Starting file extraction for:', file.name);
        const text = await extractTextFromFile(file);
        console.log('File extraction completed, setting resume text');
        setResumeText(text);
        console.log('Resume text set successfully');
      } catch (error: any) {
        console.error('File extraction error:', error);
        setParseError(error.message || 'Failed to process file. Please try again.');
        setFileName(null);
        setResumeText('');
      } finally {
        setIsParsingFile(false);
      }
    }

    // Reset the input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleClearResume = () => {
    setResumeText('');
    setFileName(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isReadyToAnalyze = resumeText.trim() && jobDescText.trim();

  return (
    <>
      <style>
        {`
          @media (min-width: 640px) {
            .responsive-button {
              background: var(--bg-desktop) !important;
              box-shadow: var(--shadow-desktop) !important;
            }
          }

          @media (max-width: 639px) {
            .file-upload-container {
              width: 100% !important;
              max-width: none !important;
            }
            .file-name-container {
              width: 100% !important;
              padding: 0.75rem !important;
            }
          }
        `}
      </style>
      <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Optimize Your Resume with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Precision</span>
          </h1>
          <p className="text-lg sm:text-base text-gray-600 max-w-2xl mx-auto">
            Get instant feedback on your resume's compatibility and build a version optimized for any job description.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <ModernCard
            variant="floating"
            className="p-8 sm:p-6 hover:shadow-2xl transition-all duration-300 w-full sm:max-w-md mx-auto hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm rounded-[29px] border-2 border-gray-200/30 shadow-xl shadow-gray-900/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Resume</h2>
                <p className="text-sm text-gray-500">Upload or paste your current resume</p>
              </div>
            </div>

            {fileName ? (
              <div className={`relative flex items-center p-3 border rounded-xl mb-4 file-name-container ${isParsingFile ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
                {isParsingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-2 flex-shrink-0"></div>
                    <span className="truncate font-medium text-blue-800 flex-1 text-sm">Processing {fileName}...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600 flex-shrink-0"/>
                    <span className="truncate font-medium text-green-800 flex-1 text-sm">{fileName}</span>
                    <button
                      onClick={handleClearResume}
                      disabled={isParsingFile}
                      className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4"/>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div
                className="relative p-8 sm:p-6 text-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group mb-4 file-upload-container border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                onClick={handleFileSelect}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  style={{ display: 'none' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-600 transition-colors duration-300 mb-3"/>
                <p className="font-semibold text-gray-900 mb-1">Click to select your resume</p>
                <p className="text-xs text-gray-500">Supports PDF, DOCX, and TXT files</p>
              </div>
            )}

            <Textarea
              placeholder="Or paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[120px] sm:min-h-[160px] bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl resize-none"
            />
            {parseError && <p className="text-sm text-red-600 mt-2">{parseError}</p>}
          </ModernCard>

          <ModernCard
            variant="floating"
            className="p-8 sm:p-6 hover:shadow-2xl transition-all duration-300 w-full sm:max-w-md mx-auto hover:scale-[1.02] hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm rounded-[36px] border-2 border-gray-200/30 shadow-xl shadow-gray-900/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                <p className="text-sm text-gray-500">Paste the target job posting</p>
              </div>
            </div>
            <Textarea
              placeholder="Paste the complete job description here..."
              value={jobDescText}
              onChange={(e) => setJobDescText(e.target.value)}
              className="min-h-[160px] sm:min-h-[200px] bg-gray-50 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl resize-none"
            />
          </ModernCard>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center">
            <button
              onClick={() => onAnalyze(resumeText, jobDescText)}
              disabled={isLoading || !isReadyToAnalyze}
              className="w-[220px] sm:w-auto sm:max-w-xs h-12 sm:h-12 mx-auto flex items-center justify-center gap-2 text-white font-bold text-sm sm:text-base px-4 py-3 sm:px-6 sm:py-3 rounded-xl sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                '--bg-desktop': 'linear-gradient(135deg, #3B00FF 0%, #6366F1 30%, #8B5CF6 70%, #A855F7 100%)',
                '--bg-mobile': 'linear-gradient(135deg, #F43F5E 0%, #8B5CF6 50%, #C4B5FD 100%)',
                '--shadow-desktop': '0 4px 15px rgba(59, 0, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                '--shadow-mobile': '0 4px 15px rgba(244, 63, 94, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                background: 'var(--bg-mobile)',
                boxShadow: 'var(--shadow-mobile)'
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Sparkles className="h-5 w-5 text-white/90" />
              <span className="relative z-10">Analyze Resume Match</span>
            </button>
          </div>

          {!isReadyToAnalyze && (
            <p className="text-gray-500 mt-4">Please provide both your resume and job description to continue</p>
          )}
        </div>
      </div>
    </>
  );
};

export default InputSection;
