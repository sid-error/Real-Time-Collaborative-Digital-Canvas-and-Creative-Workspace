import { useState, useEffect } from 'react';
import CharacterCounter from '../components/ui/CharacterCounter';
import FileUpload from '../components/ui/FileUpload';
import ImageCropper from '../components/ui/ImageCropper';
import { useAuth } from '../services/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { User, Shield, Bell, Palette, Camera, Save, Trash2, AlertTriangle, Lock, Key, X, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import DeletionSurveyModal from '../components/DeletionSurveyModal';
import { 
  requestAccountDeletion, 
  hasPendingDeletion, 
  getPendingDeletion, 
  cancelAccountDeletion, 
  clearUserData 
} from '../services/accountDeletionService';
// Import the profile update service
import { updateProfile } from '../utils/authService';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  // Profile picture and Identity states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(user?.avatar || null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [displayName, setDisplayName] = useState(user?.fullName || 'User');
  const [bio, setBio] = useState(user?.bio || '');
  const [displayNameError, setDisplayNameError] = useState('');

  // UI / Logic states
  const [notifications, setNotifications] = useState({ email: true, push: false, reminders: true, marketing: false, securityAlerts: true });
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<any>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  useEffect(() => {
    if (hasPendingDeletion()) setPendingDeletion(getPendingDeletion());
  }, []);

  /**
   * Requirement 2.1.6 & 2.2.1: Save Profile Changes
   */
const handleSaveChanges = async () => {
  if (!validateDisplayName(displayName)) return;

  try {
    const profileData = {
      displayName,
      bio,
      avatar: croppedImage as string | undefined 
    };

    const result = await updateProfile(profileData);

      if (result.success) {
        updateUser(result.user); // Synchronize Global Auth State
        alert('Profile changes saved successfully!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('An error occurred while saving.');
    }
  };

  /**
   * Requirement 2.2.2: Display Name Validation
   */
  const validateDisplayName = (name: string): boolean => {
    if (name.length < 3 || name.length > 50) {
      setDisplayNameError('Display name must be between 3 and 50 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name)) {
      setDisplayNameError('Invalid characters used');
      return false;
    }
    setDisplayNameError('');
    return true;
  };

  const handleProfilePictureSelect = (file: File | null) => {
    setSelectedImage(file);
    if (file) setShowImageCropper(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setShowImageCropper(false);
  };

  const handleRemoveProfilePicture = () => {
    setCroppedImage(null);
    setSelectedImage(null);
    setShowRemoveConfirm(false);
    updateUser({ avatar: null });
    alert('Profile picture removed!');
  };

  /**
   * Requirement 1.5: Secure Account Deletion with Forced Redirect
   */
  const handleDeleteAccount = async () => {
    if (!password) { alert('Please enter your password'); return; }
    if (deleteConfirmationText !== 'DELETE') { alert('Please type "DELETE"'); return; }

    setIsDeleting(true);
    try {
      const result = await requestAccountDeletion({ email: user?.email, password });
      if (result.success) {
        alert('Account deleted.');
        window.location.href = '/login'; // Hard redirect to wipe state
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Deletion failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-slate-500">Requirements Module 2.0: Personalization & Identity</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation */}
          <div className="w-full lg:w-64 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Panel */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {/* 2.3.1 Profile Picture Interface */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
                      <img src={croppedImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 flex gap-1">
                      <button onClick={() => document.getElementById('pic-upload')?.click()} className="bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-md"><Camera size={16} /></button>
                      {croppedImage && <button onClick={() => setShowRemoveConfirm(true)} className="bg-red-600 text-white p-2 rounded-full border-2 border-white shadow-md"><X size={16} /></button>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-4">Requirement 2.3: JPG, PNG, WebP supported.</p>
                    <FileUpload onFileSelect={handleProfilePictureSelect} acceptedFormats={['.jpg', '.png', '.webp']} maxSizeMB={5} />
                  </div>
                </div>

                <input type="file" id="pic-upload" className="hidden" accept="image/*" onChange={(e) => handleProfilePictureSelect(e.target.files?.[0] || null)} />

                {/* 2.2.1 Personal Info Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Display Name (2.2.2)</label>
                    <input type="text" value={displayName} onChange={(e) => { setDisplayName(e.target.value); validateDisplayName(e.target.value); }} className={`w-full px-4 py-2 border rounded-lg outline-none ${displayNameError ? 'border-red-500' : 'border-slate-200'}`} />
                    {displayNameError && <p className="text-red-600 text-xs">{displayNameError}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email (Read Only)</label>
                    <input type="email" value={user?.email || ''} className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-400" disabled />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold">Bio (2.2.3)</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none" placeholder="Share your creative journey..." />
                    <CharacterCounter currentLength={bio.length} maxLength={500} />
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-6 border border-red-100 bg-red-50 rounded-2xl">
                  <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                  {showPasswordConfirm ? (
                    <div className="space-y-4">
                      <input type="password" placeholder="Confirm Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                      <input type="text" placeholder='Type "DELETE"' value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} className="w-full px-4 py-2 border border-red-300 rounded-lg uppercase" />
                      <div className="flex gap-3">
                        <Button onClick={handleDeleteAccount} isLoading={isDeleting} className="bg-red-600 border-none">Delete Forever</Button>
                        <Button onClick={() => setShowPasswordConfirm(false)} variant="outline">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setShowPasswordConfirm(true)} className="bg-red-600 border-none">Delete My Account</Button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSaveChanges} className="gap-2"><Save size={18} /> Save Changes (2.1.6)</Button>
            </div>
          </div>
        </div>
      </main>

      <DeletionSurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} onComplete={() => window.location.href = '/'} userEmail={user?.email || ''} />

      {showImageCropper && selectedImage && (
        <ImageCropper imageSrc={URL.createObjectURL(selectedImage)} onCropComplete={handleCropComplete} onCancel={() => setShowImageCropper(false)} circularCrop={true} />
      )}
    </div>
  );
};

export default ProfilePage;