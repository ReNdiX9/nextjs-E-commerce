# Deploy Firestore Rules to Fix Permission Denied Error

## Quick Fix Steps (via Firebase Console)

### Step 1: Go to Firebase Console
1. Open [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google account
3. Select your Firebase project

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click on **Firestore Database**
2. Click on the **Rules** tab

### Step 3: Deploy the Rules
Copy the contents from `firestore.rules` in your project and paste it into the Firebase Console editor.

**Or manually type these rules:**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is authenticated (including anonymous)
    function isUserAuthenticated() {
      return request.auth != null && request.auth.token.firebase.sign_in_provider != null;
    }
    
    // Messages collection
    // TEMPORARY PERMISSIVE RULES - For development only
    // TODO: Enable Anonymous Authentication in Firebase Console and switch to authenticated rules
    match /messages/{messageId} {
      // Allow read for everyone (temporary for development)
      allow read: if true;
      
      // Allow write if data has required fields
      allow create: if request.resource.data.keys().hasAll(['text', 'senderId', 'senderName', 'timestamp'])
        && request.resource.data.text is string
        && request.resource.data.senderId is string;
        
      allow update, delete: if false; // Prevent updates and deletes for messages
    }
    
    // Blocked users collection
    // TEMPORARY PERMISSIVE RULES - For development only
    match /blockedUsers/{blockDoc} {
      // Allow read for everyone (temporary)
      allow read: if true;
      
      // Allow write with validation
      allow create: if request.resource.data.keys().hasAll(['blockerId', 'blockedId', 'timestamp']);
      allow delete: if true; // Allow deletion
      allow update: if false; // Prevent updates
    }
    
    // Default deny rule for all other documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish
1. Click the **Publish** button
2. Wait for confirmation that rules have been published
3. Refresh your application

### Step 5: Verify
After deploying the rules, your chat should work without permission errors.

## Alternative: Install Firebase CLI

If you want to use Firebase CLI for easier deployments:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not already done):**
   ```bash
   firebase init firestore
   ```
   - Choose to use existing `firestore.rules` file
   - Choose to use existing `firestore.indexes.json` file

4. **Deploy the rules:**
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## Security Note

The current rules are **permissive for development**. They allow anyone to read/write messages. For production:

1. Enable Anonymous Authentication in Firebase Console
2. Update the rules to use authenticated-only access
3. See `firestore.rules` for the commented secure rules

