import React, { useState, useEffect } from 'react';

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
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Hidden on mobile when content is shown */}
      <div className={`w-80 bg-white border-r border-gray-200 flex flex-col md:flex ${showContent ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-black">Pocket Notes</h1>
        </div>
        
        {/* Groups List */}
        <div className="flex-1 px-4 pb-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedGroup && selectedGroup.id === group.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => selectGroup(group)}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4"
                style={{ backgroundColor: group.color }}
              >
                {group.initials}
              </div>
              <span className="text-gray-800 font-medium">{group.name}</span>
            </div>
          ))}
        </div>
        
        {/* Add Group Button */}
        <div className="p-4">
          <button
            onClick={() => setShowCreateGroup(true)}
            className="hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors ml-auto"
          >
           <img src={addBtn} className='w-14 h-14' alt="" />
          </button>
        </div>
      </div>
      
      {/* Right Main Content - Full screen on mobile when content is shown */}
      <div className={`flex-1 flex flex-col ${showContent ? 'flex md:flex' : 'hidden md:flex'}`}>
        {selectedGroup ? (
          <>
            {/* Header with group info and back button for mobile */}
            <div className="bg-blue-600 px-6 py-4 flex items-center">
              {/* Back button - visible only on mobile */}
              <button
                onClick={goBackToGroups}
                className="md:hidden mr-4 text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
               <img src={sendBtn} alt="" />
              </button>
              
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4"
                style={{ backgroundColor: selectedGroup.color }}
              >
                {selectedGroup.initials}
              </div>
              <h2 className="text-xl font-semibold text-white">{selectedGroup.name}</h2>
            </div>
            
            {/* Notes Display Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              {notes[selectedGroup.id] && notes[selectedGroup.id].map((note) => (
                <div key={note.id} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-800 whitespace-pre-wrap mb-3">{note.text}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{note.date}</span>
                    <span className="mx-2">•</span>
                    <span>{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Note Input Area */}
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyPress={handleNoteKeyPress}
                    placeholder="Here's the sample text for sample work"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 min-h-[80px]"
                    rows="3"
                  />
                </div>
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  className={`p-3 rounded-lg transition-colors ${
                    noteText.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                 <img src={sendBtn} className='w-6 h-6 ' alt="" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome message when no group selected */
          <div className="flex-1 flex items-center justify-center bg-blue-100">
            <div className="text-center flex justify-center items-center flex-col">
            <img src={image} className='md:w-[400px] md:h-[250px] h-[150px] w-[300px]' alt="" />
              <h1 className="text-4xl font-medium text-gray-600 mb-2">Pocket Notes</h1>
              <p className="text-gray-500">Send and receive messages without keeping your phone online.
Use Pocket Notes on up to 4 linked devices and 1 mobile phone</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Group Popup */}
      {showCreateGroup && (
        <div 
          className="popup-background fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Create New group</h3>
            
            {/* Group Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyPress={handleGroupNameKeyPress}
                placeholder="Enter group name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            
            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose colour
              </label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ${
                      selectedColor === color ? 'ring-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            {/* Create Button */}
            <button
              onClick={createGroup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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