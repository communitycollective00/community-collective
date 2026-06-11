# PHASE 2 E2E TEST FLOW
> Last Updated: 2026-06-11

## Setup Required
1. Server running at http://localhost:3000
2. Authenticated as a verified professional (professional_pending, professional, or admin role)
3. Access to camera (for mobile device or PC with camera)

## Test 1: Photo Post - Complete Flow

### 1.1 Create Photo Post
- [ ] Navigate to http://localhost:3000/posts/create
- [ ] Title field: Enter "Test Photo - [Timestamp]"
- [ ] Post type dropdown: Select "Photo"
- [ ] Body field: Enter "This is a test photo post to verify media uploads work correctly."
- [ ] MediaCapture component appears with:
  - [ ] "📷 Open Camera" button (if camera available)
  - [ ] "📁 Choose Photo" button (file fallback)

### 1.2 Capture or Upload Photo
**Option A: Via Camera**
- [ ] Click "📷 Open Camera" button
- [ ] Grant camera permission when prompted
- [ ] Verify live video feed displays in camera view
- [ ] Click "📸 Capture" button
- [ ] Photo uploads to Supabase Storage (look for "Uploading photo..." message)
- [ ] Verify preview displays with "📸 Photo ready" message
- [ ] Verify "Capture Again" button appears

**Option B: Via File Upload**
- [ ] Click "📁 Choose Photo" button
- [ ] Select any image file from device
- [ ] Verify upload completes
- [ ] Verify preview displays

### 1.3 Publish Post
- [ ] Click "Publish post" button
- [ ] Verify success (redirect to dashboard or success message)
- [ ] Note the post ID or title

### 1.4 Verify Photo Appears on Dashboard
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Verify "Recent posts" section shows the new photo post
- [ ] Verify title displays
- [ ] Verify post type shows "image"

### 1.5 Verify Photo Appears on Profile
- [ ] Navigate to http://localhost:3000/profile
- [ ] Verify "Recent posts & media" section shows the new photo post
- [ ] Verify image preview displays with correct dimensions

### 1.6 Verify Photo Appears on Homepage
- [ ] Navigate to http://localhost:3000 (homepage)
- [ ] Scroll to "Latest Posts & Media" section
- [ ] Verify the photo post appears in the grid
- [ ] Verify image preview is visible
- [ ] Click on the post card - verify it links correctly

### 1.7 Verify Photo on Directory Profile
- [ ] Get your username from profile page
- [ ] Navigate to http://localhost:3000/directory/[your-username]
- [ ] Verify "Recent posts & media" section shows the photo post
- [ ] Verify image displays with correct styling

**✓ Test 1 Complete**

---

## Test 2: Video Post - Complete Flow

### 2.1 Create Video Post
- [ ] Navigate to http://localhost:3000/posts/create
- [ ] Title field: Enter "Test Video - [Timestamp]"
- [ ] Post type dropdown: Select "Video"
- [ ] Body field: Enter "This is a test video post to verify media uploads work correctly."
- [ ] MediaCapture component appears with:
  - [ ] "🎥 Record Video" button (if camera available)
  - [ ] "📁 Choose Video" button (file fallback)

### 2.2 Capture or Upload Video
**Option A: Via Camera**
- [ ] Click "🎥 Record Video" button
- [ ] Grant camera + microphone permissions when prompted
- [ ] Verify live video feed displays
- [ ] Click "🎬 Start Recording" button
- [ ] Record 3-5 seconds of video
- [ ] Click "⏹ Stop Recording" button
- [ ] Verify "Processing video..." message
- [ ] Video uploads to Supabase Storage
- [ ] Verify preview displays with "🎬 Video ready" message
- [ ] Verify video player shows controls

**Option B: Via File Upload**
- [ ] Click "📁 Choose Video" button
- [ ] Select any video file from device
- [ ] Verify upload completes
- [ ] Verify preview displays with video player

### 2.3 Publish Video Post
- [ ] Click "Publish post" button
- [ ] Verify success
- [ ] Note the post ID or title

### 2.4 Verify Video Appears on Dashboard
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Verify "Recent posts" section shows the new video post
- [ ] Verify title displays
- [ ] Verify post type shows "video"

### 2.5 Verify Video Appears on Profile
- [ ] Navigate to http://localhost:3000/profile
- [ ] Verify "Recent posts & media" section shows the new video post
- [ ] Verify video player displays with controls

### 2.6 Verify Video Appears on Homepage
- [ ] Navigate to http://localhost:3000 (homepage)
- [ ] Scroll to "Latest Posts & Media" section
- [ ] Verify the video post appears in the grid
- [ ] Verify video player is visible
- [ ] Click on the post card - verify it links correctly
- [ ] Video player should have controls (play, pause, progress bar)

### 2.7 Verify Video on Directory Profile
- [ ] Navigate to http://localhost:3000/directory/[your-username]
- [ ] Verify "Recent posts & media" section shows the video post
- [ ] Verify video player displays with controls

**✓ Test 2 Complete**

---

## Test 3: Cross-User Visibility

### 3.1 Verify Posts Visible to Other Users
- [ ] Get another user's username (from directory)
- [ ] Navigate to http://localhost:3000/directory/[other-username]
- [ ] Verify their posts appear if they have any
- [ ] Verify your photo and video posts DON'T appear (they should only see the other user's posts)

### 3.2 Verify Homepage Feed Shows All Users' Posts
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Create a second test account (different email)
- [ ] Log in as second account
- [ ] Create a post (photo or video)
- [ ] Log back in as first account
- [ ] Navigate to http://localhost:3000/dashboard
- [ ] Scroll to "Latest Posts & Media"
- [ ] Verify BOTH your posts AND the other user's posts appear
- [ ] Verify author names are correct for each post

**✓ Test 3 Complete**

---

## Mobile Layout Test

### 4.1 Test on Mobile Device or Mobile Browser View
- [ ] Open dev tools (F12) → Device Emulation
- [ ] Switch to iPhone 12 / iPad view
- [ ] Navigate to all test routes:
  - [ ] http://localhost:3000/posts/create (form should stack vertically)
  - [ ] http://localhost:3000/dashboard (posts should reflow)
  - [ ] http://localhost:3000 (posts grid should be single column on mobile)
  - [ ] http://localhost:3000/directory/[username] (posts should display cleanly)

### 4.2 Verify Touch-Friendly Controls
- [ ] Media capture buttons should be easily tappable (48px+)
- [ ] Photo/video preview should display at appropriate size
- [ ] All form inputs should be properly sized for touch

**✓ Test 4 Complete**

---

## Performance Checks

### 5.1 Page Load Times
- [ ] Use Lighthouse DevTools audits
- [ ] Homepage should load in <3s
- [ ] Dashboard should load in <2s
- [ ] Post creation page should load in <2s

### 5.2 Image/Video Performance
- [ ] Verify images are properly sized (not full resolution)
- [ ] Verify videos are properly encoded

**✓ Test 5 Complete**

---

## FINAL VALIDATION

If ALL tests pass, the system is **PRODUCTION READY** for:
- ✓ Photo posting (capture + upload + display)
- ✓ Video posting (capture + upload + display)
- ✓ Homepage visibility
- ✓ Profile visibility
- ✓ Dashboard visibility
- ✓ Mobile compatibility

Mark as JUNE 17 INTERVIEW READY
