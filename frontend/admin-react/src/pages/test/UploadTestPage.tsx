import React, { useState, useRef } from 'react';
import './UploadTestPage.css';



const UploadTestPage: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your gateway/service port

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch(`${API_BASE_URL}/users/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload success:', result);
      
      // Since the API returns a string (URL), we might need to fetch the profile again 
      // or manually add it to the state. For testing, we'll just show the last uploaded.
      // In a real app, we'd fetch the updated profile.
      alert('Upload successful! Check console for result.');
      
      // Refresh logic would go here
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-test-container">
      <div className="glass-card">
        <header className="test-header">
          <h2 className="gradient-text">Upload Test Lab</h2>
          <p className="subtitle">Test your Avatar and Photo upload APIs here</p>
        </header>

        <section className="config-section">
          <div className="input-group">
            <label>Auth Token</label>
            <input 
              type="text" 
              value={token} 
              onChange={(e) => setToken(e.target.value)} 
              placeholder="Paste your JWT token here..."
              className="token-input"
            />
          </div>
        </section>

        <main className="upload-grid">
          {/* Avatar Section */}
          <div className="upload-box avatar-box">
            <div className="box-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
              </svg>
              <h3>Avatar Test</h3>
            </div>
            <p className="info">Uploading the first photo automatically sets it as Avatar.</p>
            <div className="preview-circle">
              {uploading ? (
                <div className="loader"></div>
              ) : (
                <div className="placeholder-icon">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#ccc"/>
                  </svg>
                </div>
              )}
            </div>
            <button 
              className="btn-primary" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          </div>

          {/* Photo Gallery Section */}
          <div className="upload-box gallery-box">
            <div className="box-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
              </svg>
              <h3>Photo Gallery</h3>
            </div>
            <p className="info">Add up to 6 photos. Managed via /api/users/photos</p>
            
            <div className="photo-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="photo-slot">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#eee"/>
                  </svg>
                </div>
              ))}
            </div>

            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
              Add Photos
            </button>
          </div>
        </main>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          style={{ display: 'none' }} 
          accept="image/*"
        />

        {error && (
          <div className="error-toast">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
            </svg>
            {error}
          </div>
        )}
      </div>

      <div className="api-info-panel">
        <h3>Backend API Status</h3>
        <ul>
          <li><span className="method post">POST</span> <code>/api/users/photos</code> <span className="status ok">Found</span></li>
          <li><span className="method delete">DELETE</span> <code>/api/users/photos/&#123;id&#125;</code> <span className="status ok">Found</span></li>
          <li><span className="method patch">PATCH</span> <code>/api/users/photos/reorder</code> <span className="status ok">Found</span></li>
        </ul>
        <p className="note">* Note: First photo upload is automatically assigned as <strong>Avatar</strong> (IsPrimary=true).</p>
      </div>
    </div>
  );
};

export default UploadTestPage;
