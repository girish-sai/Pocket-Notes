import React, { useState, useEffect } from 'react';
import './app.css'; // Import the CSS file

import addBtn from './images/add.png'
import image from './images/1.png'
import sendBtn from './images/send.png'

const NotesApp = () => {
  // All our data storage
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState({});
  const [showContent, setShowContent] = useState(false); // For mobile view
  
  const colors = ['#8B5CF6', '#EC4899', '#22D3EE', '#F97316', '#3B82F6', '#10B981'];
  
  // Load data when app starts
  useEffect(() => {
    const savedGroups = localStorage.getItem('notesGroups');
    const savedNotes = localStorage.getItem('notesData');
    
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);
  
  // Save groups to localStorage
  function saveGroups(groupsToSave) {
    localStorage.setItem('notesGroups', JSON.stringify(groupsToSave));
  }
  
  // Save notes to localStorage
  function saveNotes(notesToSave) {
    localStorage.setItem('notesData', JSON.stringify(notesToSave));
  }
  
  // Make initials from name
  function makeInitials(name) {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  
  // Create new group
  function createGroup() {
    // Check if name is too short
    if (groupName.trim().length < 2) {
      alert('Group name should be at least 2 characters long');
      return;
    }
    
    // Check if group already exists
    let groupExists = false;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].name.toLowerCase() === groupName.trim().toLowerCase()) {
        groupExists = true;
        break;
      }
    }
    
    if (groupExists) {
      alert('A group with this name already exists');
      return;
    }
    
    // Create the new group
    const newGroup = {
      id: Date.now(),
      name: groupName.trim(),
      color: selectedColor,
      initials: makeInitials(groupName.trim())
    };
    
    // Add to groups list
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    saveGroups(newGroups);
    
    // Create empty notes array for this group
    const newNotes = { ...notes, [newGroup.id]: [] };
    setNotes(newNotes);
    saveNotes(newNotes);
    
    // Close popup and reset form
    setShowCreateGroup(false);
    setGroupName('');
    setSelectedColor('#8B5CF6');
  }
  
  // Add new note
  function addNote() {
    if (!noteText.trim() || !selectedGroup) {
      return;
    }
    
    const now = new Date();
    const newNote = {
      id: Date.now(),
      text: noteText.trim(),
      createdAt: now.toISOString(),
      date: now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
    
    // Add note to the selected group
    const currentNotes = notes[selectedGroup.id] || [];
    const updatedNotes = [...currentNotes, newNote];
    const newNotesData = { ...notes, [selectedGroup.id]: updatedNotes };
    
    setNotes(newNotesData);
    saveNotes(newNotesData);
    setNoteText('');
  }
  
  // Handle Enter key in note input
  function handleNoteKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  }
  
  // Handle Enter key in group name input
  function handleGroupNameKeyPress(e) {
    if (e.key === 'Enter') {
      createGroup();
    }
  }
  
  // Close popup when clicking outside
  function handleBackgroundClick(e) {
    if (e.target.classList.contains('popup-background')) {
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedColor('#8B5CF6');
    }
  }

  // Handle group selection for mobile
  function selectGroup(group) {
    setSelectedGroup(group);
    setShowContent(true); // Show content on mobile
  }

  // Go back to groups list on mobile
  function goBackToGroups() {
    setShowContent(false);
    setSelectedGroup(null);
  }
  
  return (
    <div className="app-container">
      {/* Left Sidebar - Hidden on mobile when content is shown */}
      <div className={`sidebar ${showContent ? 'sidebar-hidden-mobile' : 'sidebar-visible'}`}>
        {/* Header */}
        <div className="header">
          <h1 className="header-title">Pocket Notes</h1>
        </div>
        
        {/* Groups List */}
        <div className="groups-container">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${
                selectedGroup && selectedGroup.id === group.id ? 'group-item-selected' : ''
              }`}
              onClick={() => selectGroup(group)}
            >
              <div
                className="group-avatar"
                style={{ backgroundColor: group.color }}
              >
                {group.initials}
              </div>
              <span className="group-name">{group.name}</span>
            </div>
          ))}
        </div>
        
        {/* Add Group Button */}
        <div className="add-button-container">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="add-button"
          >
           <img src={addBtn} className='w-14 h-14' alt="" />
          </button>
        </div>
      </div>
      
      {/* Right Main Content - Full screen on mobile when content is shown */}
      <div className={`main-content ${showContent ? 'main-content-visible' : 'main-content-hidden-mobile'}`}>
        {selectedGroup ? (
          <>
            {/* Header with group info and back button for mobile */}
            <div className="group-header">
              {/* Back button - visible only on mobile */}
              <button
                onClick={goBackToGroups}
                className="back-button"
              >
               <img src={sendBtn} alt="" />
              </button>
              
              <div
                className="group-header-avatar"
                style={{ backgroundColor: selectedGroup.color }}
              >
                {selectedGroup.initials}
              </div>
              <h2 className="group-header-title">{selectedGroup.name}</h2>
            </div>
            
            {/* Notes Display Area */}
            <div className="notes-container">
              {notes[selectedGroup.id] && notes[selectedGroup.id].map((note) => (
                <div key={note.id} className="note-item">
                  <p className="note-text">{note.text}</p>
                  <div className="note-meta">
                    <span>{note.date}</span>
                    <span className="note-meta-separator">•</span>
                    <span>{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Note Input Area */}
            <div className="input-container">
              <div className="input-wrapper">
                <div className="input-field-container">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyPress={handleNoteKeyPress}
                    placeholder="Here's the sample text for sample work"
                    className="input-field"
                    rows="3"
                  />
                </div>
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  className={`send-button ${
                    noteText.trim()
                      ? 'send-button-active'
                      : 'send-button-inactive'
                  }`}
                >
                 <img src={sendBtn} className='w-6 h-6' alt="" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome message when no group selected */
          <div className="welcome-container">
            <div className="welcome-content">
            <img src={image} className='welcome-image' alt="" />
              <h1 className="welcome-title">Pocket Notes</h1>
              <p className="welcome-subtitle">Send and receive messages without keeping your phone online.
Use Pocket Notes on up to 4 linked devices and 1 mobile phone</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Group Popup */}
      {showCreateGroup && (
        <div 
          className="popup-background"
          onClick={handleBackgroundClick}
        >
          <div className="popup-content">
            <h3 className="popup-title">Create New group</h3>
            
            {/* Group Name Input */}
            <div className="form-group">
              <label className="form-label">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyPress={handleGroupNameKeyPress}
                placeholder="Enter group name"
                className="form-input"
                autoFocus
              />
            </div>
            
            {/* Color Selection */}
            <div className="color-selection">
              <label className="form-label">
                Choose colour
              </label>
              <div className="color-options">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`color-option ${
                      selectedColor === color ? 'color-option-selected' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Create Button */}
            <button
              onClick={createGroup}
              className="create-button"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesApp;