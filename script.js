// =====================
// LIVE CLOCK (non-blocking)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const clock = document.getElementById("clock");
  if (!clock) return;

  // Initialize clock immediately
  const now = new Date();
  clock.textContent = `${now.toLocaleTimeString()} ${now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;

  // Update every second
  setInterval(() => {
    const now = new Date();
    clock.textContent = `${now.toLocaleTimeString()} ${now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  }, 1000);
});


// THEME TOGGLE
const toggle = document.getElementById("themeToggle")

if (localStorage.theme === "dark") {
  document.body.classList.add("dark")
}

if (toggle) {
  toggle.onclick = () => {
    document.body.classList.toggle("dark")
    localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light"
  }
}


// TASK STORAGE
let tasks=JSON.parse(localStorage.tasks||"[]")
let subjects = JSON.parse(localStorage.subjects || '["Math","Science","English","History","General"]')

function save(){
localStorage.tasks=JSON.stringify(tasks)
}


const input=document.getElementById("taskInput")
const subjectSelect=document.getElementById("subject")
const list=document.getElementById("taskList")
const addBtn=document.getElementById("addTask")


// ENTER KEY ADD TASK
if(input){
input.addEventListener("keypress",(e)=>{
if(e.key==="Enter"){
addTask()
}
})
}

if(addBtn){
addBtn.onclick=addTask
}


function addTask(){
// Create a new task with empty name that will be filled in edit modal
let task={
text:"",
subject:subjectSelect ? subjectSelect.value : "General",
done:false,
description:"",
deadline:"",
startDate:new Date().toISOString()
}

tasks.push(task)

save()

renderTasks()
renderStats()

// Auto-open edit modal for the newly created task
const newTaskIndex=tasks.length-1
console.log('Auto-opening edit modal for new task at index:', newTaskIndex)
openEditModal(newTaskIndex)
}


function renderTasks(){

if(!list) return

list.innerHTML=""

tasks.forEach((t,i)=>{

let task=document.createElement("div")
task.className="task"

if(t.done) task.classList.add("done")


let info=document.createElement("div")
info.className="task-info"

let subject=document.createElement("div")
subject.className="task-subject"
subject.textContent=t.subject

let text=document.createElement("div")
text.className="task-text"
text.textContent=t.text

info.appendChild(subject)
info.appendChild(text)

// Add description if it exists
if(t.description && t.description.trim()){
let description=document.createElement("div")
description.className="task-description"
description.textContent=t.description
info.appendChild(description)
}

let actions=document.createElement("div")
actions.className="task-actions"


let done=document.createElement("button")
done.className="done-btn"
done.textContent=t.done?"UNDO":"DONE"

done.onclick=()=>{
t.done=!t.done
save()
renderTasks()
}


let edit=document.createElement("button")
edit.className="edit-btn"
edit.textContent="EDIT"

edit.onclick=()=>{
console.log('Edit button clicked for task index:', i)
openEditModal(i)
}

let del=document.createElement("button")
del.className="delete-btn"
del.textContent="DELETE"

del.onclick=()=>{
console.log('Delete button clicked for task index:', i)
openDeleteModal(i)
}

actions.appendChild(done)
actions.appendChild(edit)
actions.appendChild(del)

task.appendChild(info)
task.appendChild(actions)

list.appendChild(task)

})

}

renderTasks()
renderStats()

// EDIT MODAL FUNCTIONALITY
console.log('Initializing edit modal functionality')
const editModal=document.getElementById("editModal")
const editForm=document.getElementById("editForm")
const cancelEdit=document.getElementById("cancelEdit")
let currentEditIndex=-1

console.log('Edit modal elements:', {editModal, editForm, cancelEdit})

function openEditModal(index){
console.log('Opening edit modal for task index:', index)
currentEditIndex=index
const task=tasks[index]
console.log('Task data:', task)

document.getElementById("editName").value=task.text
document.getElementById("editSubject").value=task.subject
document.getElementById("editDescription").value=task.description||""

// Set default due date to current day if task doesn't have one
let deadlineDate=""
let deadlineTime=""

if(task.deadline && task.deadline.includes(" ")){
const [date, time]=task.deadline.split(" ")
deadlineDate=date
deadlineTime=time
}else{
deadlineDate=new Date().toISOString().slice(0,10)
deadlineTime="12:00"
}

document.getElementById("editDeadlineDate").value=deadlineDate
document.getElementById("editDeadlineTime").value=deadlineTime

// Set start date from task
let startDate=""
let startTime=""

if(task.startDate && task.startDate.includes("T")){
const isoDate=new Date(task.startDate)
startDate=isoDate.toISOString().slice(0,10)
startTime=isoDate.toTimeString().slice(0,5)
}else{
startDate=new Date().toISOString().slice(0,10)
startTime=new Date().toTimeString().slice(0,5)
}

document.getElementById("editStartDateDate").value=startDate
document.getElementById("editStartTime").value=startTime

console.log('Modal elements set, showing modal')
editModal.style.display="block"
}

function closeEditModal(){
console.log('Closing edit modal')
editModal.style.display="none"
currentEditIndex=-1
}

if(cancelEdit){
console.log('Setting up cancel button handler')
cancelEdit.onclick=()=>{
console.log('Cancel button clicked, checking if task has name')
const taskName = document.getElementById("editName").value.trim()
if(!taskName && currentEditIndex !== -1){
console.log('Task has no name, showing unnamed task modal')
openUnnamedTaskModal(currentEditIndex)
}else{
closeEditModal()
}
}
}

if(editForm){
console.log('Setting up form submission handler')
editForm.onsubmit=(e)=>{
e.preventDefault()
console.log('Form submitted for task index:', currentEditIndex)

if(currentEditIndex===-1) return

// Validate task name and subject
const taskName = document.getElementById("editName").value.trim()
const taskSubject = document.getElementById("editSubject").value

if(!taskName){
openUnnamedTaskModal(currentEditIndex)
return
}

if(!taskSubject){
showNotification('Subject is required', 'warning')
return
}

const task=tasks[currentEditIndex]
task.text=taskName
task.subject=taskSubject
task.description=document.getElementById("editDescription").value

// Combine date and time inputs
const deadlineDate=document.getElementById("editDeadlineDate").value
const deadlineTime=document.getElementById("editDeadlineTime").value
task.deadline=`${deadlineDate} ${deadlineTime}`

// Update start date if advanced section is visible
const advancedSection=document.getElementById("advancedSection")
if(advancedSection.classList.contains("show")){
const startDate=document.getElementById("editStartDateDate").value
const startTime=document.getElementById("editStartTime").value
const startDateTime=new Date(`${startDate}T${startTime}`)
task.startDate=startDateTime.toISOString()
}

console.log('Updated task:', task)
save()
renderTasks()
renderStats()
closeEditModal()
}
}

// Advanced toggle functionality
const advancedToggle=document.querySelector(".advanced-toggle")
const advancedSection=document.getElementById("advancedSection")
const arrow=document.querySelector(".arrow")

if(advancedToggle){
advancedToggle.onclick=()=>{
advancedSection.classList.toggle("show")
arrow.classList.toggle("expanded")
}
}

// DELETE MODAL FUNCTIONALITY
console.log('Initializing delete modal functionality')
const deleteModal=document.getElementById("deleteModal")
const deleteForm=document.getElementById("deleteForm")
const cancelDelete=document.getElementById("cancelDelete")
const confirmDeleteBtn=document.getElementById("confirmDeleteBtn")
let currentDeleteIndex=-1

console.log('Delete modal elements:', {deleteModal, deleteForm, cancelDelete})

function openDeleteModal(index){
console.log('Opening delete modal for task index:', index)
currentDeleteIndex=index
const task=tasks[index]
console.log('Task to delete:', task)

// If task has no name, delete immediately without confirmation
if(!task.text || task.text.trim() === ""){
console.log('Task has empty name, deleting immediately')
tasks.splice(currentDeleteIndex,1)
save()
renderTasks()
renderStats()
currentDeleteIndex=-1
return
}

const quotedTaskName=`"${task.text}"`
document.getElementById("deleteTaskName").textContent=quotedTaskName
const confirmInput = document.getElementById("confirmDelete")
confirmInput.value=""
confirmInput.placeholder = task.text
confirmInput.style.opacity = '1'
confirmInput.style.fontStyle = 'normal'
confirmInput.focus()

// Add input event listener to handle placeholder visibility
confirmInput.oninput = function() {
  if (this.value.length > 0) {
    this.style.opacity = '1'
    this.style.fontStyle = 'normal'
  } else {
    this.style.opacity = '0.5'
    this.style.fontStyle = 'italic'
  }
}

console.log('Delete modal elements set, showing modal')
deleteModal.style.display="block"
}

function closeDeleteModal(){
console.log('Closing delete modal')
deleteModal.style.display="none"
currentDeleteIndex=-1
}

if(cancelDelete){
console.log('Setting up cancel delete button handler')
cancelDelete.onclick=closeDeleteModal
}

if(deleteForm){
console.log('Setting up delete form submission handler')
deleteForm.onsubmit=(e)=>{
e.preventDefault()
console.log('Delete form submitted for task index:', currentDeleteIndex)

if(currentDeleteIndex===-1) return

const task=tasks[currentDeleteIndex]
const confirmText=document.getElementById("confirmDelete").value

console.log('Confirmation text entered:', confirmText)
console.log('Task name to match:', task.text)

if(confirmText===task.text){
console.log('Confirmation matches, deleting task')
tasks.splice(currentDeleteIndex,1)
save()
renderTasks()
renderStats()
closeDeleteModal()
}else{
console.log('Confirmation does not match, showing alert')
      showNotification('Task name does not match. Please type the exact task name to confirm deletion.', 'warning')
}
}
}

// UNNAMED TASK MODAL FUNCTIONALITY
console.log('Initializing unnamed task modal functionality')
const unnamedTaskModal = document.getElementById("unnamedTaskModal")
const addNameBtn = document.getElementById("addNameBtn")
const discardTaskBtn = document.getElementById("discardTaskBtn")
let currentUnnamedTaskIndex = -1

function openUnnamedTaskModal(index) {
  console.log('Opening unnamed task modal for task index:', index)
  currentUnnamedTaskIndex = index
  unnamedTaskModal.style.display = "block"
}

function closeUnnamedTaskModal() {
  console.log('Closing unnamed task modal')
  unnamedTaskModal.style.display = "none"
  currentUnnamedTaskIndex = -1
}

if (addNameBtn) {
  addNameBtn.onclick = () => {
    console.log('Add name button clicked, keeping modal open')
    closeUnnamedTaskModal()
    // Focus on the task name input in the edit modal
    const editNameInput = document.getElementById("editName")
    if (editNameInput) {
      editNameInput.focus()
    }
  }
}

if (discardTaskBtn) {
  discardTaskBtn.onclick = () => {
    console.log('Discard task button clicked, deleting task at index:', currentUnnamedTaskIndex)
    if (currentUnnamedTaskIndex !== -1) {
      tasks.splice(currentUnnamedTaskIndex, 1)
      save()
      renderTasks()
      renderStats()
      closeEditModal()
      closeUnnamedTaskModal()
      showNotification('Task discarded', 'delete')
    }
  }
}

// Close modal when clicking outside
window.onclick=(event)=>{
if(event.target===editModal){
console.log('Clicked outside modal, checking if task has name')
const taskName = document.getElementById("editName").value.trim()
if(!taskName && currentEditIndex !== -1){
console.log('Task has no name, showing unnamed task modal')
openUnnamedTaskModal(currentEditIndex)
}else{
closeEditModal()
}
}
if(event.target===deleteModal){
console.log('Clicked outside delete modal, closing')
closeDeleteModal()
}
if(event.target===unnamedTaskModal){
console.log('Clicked outside unnamed task modal, closing')
closeUnnamedTaskModal()
}
if(event.target===settingsMenu){
console.log('Clicked outside settings menu, closing')
closeSettingsMenu()
}
}

// NOTIFICATION FUNCTION
function showNotification(message, icon = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.innerHTML = `
    <div class="notification-content">
      <span class="material-symbols-outlined notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
    </div>
    <button class="notification-close">×</button>
  `
  
  // Add to body
  document.body.appendChild(notification)
  
  // Show notification
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)
  
  // Close button handler
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.onclick = () => {
    notification.classList.remove("show")
    setTimeout(() => {
      notification.remove()
    }, 300)
  }
  
  // Auto close after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove("show")
      setTimeout(() => {
        if (notification.parentNode) notification.remove()
      }, 300)
    }
  }, 5000)
}

// SETTINGS MENU
const gearIcon = document.getElementById("gearIcon")
const settingsMenu = document.getElementById("settingsMenu")
const calendarUrlBtn = document.getElementById("calendarUrlBtn")

function toggleSettingsMenu() {
  settingsMenu.classList.toggle("show")
}

function closeSettingsMenu() {
  settingsMenu.classList.remove("show")
}

if (gearIcon) {
  gearIcon.onclick = (e) => {
    e.stopPropagation()
    toggleSettingsMenu()
  }
}

if (calendarUrlBtn) {
  calendarUrlBtn.onclick = showCalendarView
}

// SETTINGS VIEW NAVIGATION
const mainSettingsView = document.getElementById("mainSettingsView")
const subjectsView = document.getElementById("subjectsView")
const calendarView = document.getElementById("calendarView")
const subjectsManagementBtn = document.getElementById("subjectsManagementBtn")
const backToMain = document.getElementById("backToMain")
const backToMainFromCalendar = document.getElementById("backToMainFromCalendar")

function showSubjectsView() {
  console.log('Showing subjects view')
  console.log('Current subjects:', subjects)
  mainSettingsView.classList.add("hidden")
  subjectsView.classList.remove("hidden")
  if (calendarView) {
    calendarView.classList.add("hidden")
  }
  renderSubjects()
}

function showCalendarView() {
  console.log('Showing calendar view')
  console.log('Current calendar view')
  mainSettingsView.classList.add("hidden")
  subjectsView.classList.add("hidden")
  calendarView.classList.remove("hidden")
  updateCalendarUrlDisplay()
}

function showMainSettingsView() {
  console.log('Showing main settings view')
  subjectsView.classList.add("hidden")
  if (calendarView) {
    calendarView.classList.add("hidden")
  }
  mainSettingsView.classList.remove("hidden")
}

if (subjectsManagementBtn) {
  subjectsManagementBtn.onclick = showSubjectsView
}

if (backToMain) {
  backToMain.onclick = showMainSettingsView
}

if (backToMainFromCalendar) {
  backToMainFromCalendar.onclick = showMainSettingsView
}

// CALENDAR URL MANAGEMENT
const calendarUrlInput = document.getElementById("calendarUrlInput")
const saveCalendarUrl = document.getElementById("saveCalendarUrl")
const removeCalendarUrl = document.getElementById("removeCalendarUrl")
const refreshCalendar = document.getElementById("refreshCalendar")
const calendarUrlDisplay = document.getElementById("calendarUrlDisplay")

function updateCalendarUrlDisplay() {
  const currentUrl = localStorage.calendarUrl
  if (calendarUrlDisplay) {
    calendarUrlDisplay.textContent = currentUrl || 'No calendar set'
  }
  if (calendarUrlInput) {
    calendarUrlInput.value = currentUrl || ''
  }
}

function updateTimeFormatDisplay() {
  const currentTimeFormat = localStorage.timeFormat || '24'
  
  // Only update if elements exist (they're only on calendar page)
  // Check both for undefined and null
  if (typeof timeFormat24 !== 'undefined' && timeFormat24 && 
      typeof timeFormat12 !== 'undefined' && timeFormat12) {
    if (currentTimeFormat === '12') {
      timeFormat12.checked = true
    } else {
      timeFormat24.checked = true
    }
  }
}

function getTimeFormat() {
  return localStorage.timeFormat || '24'
}

function formatTime(date) {
  const timeFormat = getTimeFormat()
  
  if (timeFormat === '12') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } else {
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

if (saveCalendarUrl) {
  saveCalendarUrl.onclick = async () => {
    const url = calendarUrlInput.value.trim()
    if (!url) {
      return
    }
    
    try {
      localStorage.calendarUrl = url
      
      // Initialize calendar if on calendar page
      if (window.calendarDisplay) {
        await window.calendarDisplay.initialize(url)
      }
      
      updateCalendarUrlDisplay()
    } catch (error) {
      console.error('Failed to save calendar:', error)
    }
  }
}

if (removeCalendarUrl) {
  removeCalendarUrl.onclick = () => {
    if (confirm('Are you sure you want to remove the calendar?')) {
      localStorage.removeItem('calendarUrl')
      updateCalendarUrlDisplay()
      
      // Clear calendar display
      if (window.calendarDisplay) {
        window.calendarDisplay.renderEmptyCalendar()
      }
    }
  }
}

if (refreshCalendar) {
  refreshCalendar.onclick = async () => {
    const url = localStorage.calendarUrl
    if (!url) {
      return
    }
    
    try {
      // Re-initialize calendar
      if (window.calendarDisplay) {
        await window.calendarDisplay.initialize(url)
      }
    } catch (error) {
      console.error('Failed to refresh calendar:', error)
    }
  }
}

const saveTimeFormat = document.getElementById("saveTimeFormat")
if (saveTimeFormat) {
  saveTimeFormat.onclick = () => {
    const selectedFormat = document.querySelector('input[name="timeFormat"]:checked')
    if (!selectedFormat) {
      showNotification('Please select a time format', 'warning')
      return
    }
    
    const format = selectedFormat.value
    localStorage.timeFormat = format
    
    showNotification(`Time format set to ${format}-hour`, 'check_circle')
    
    // Refresh calendar if it exists
    if (window.calendarDisplay) {
      window.calendarDisplay.renderCalendar()
    }
  }
}

// Initialize time format display on page load
updateTimeFormatDisplay()

// Initialize calendar URL display on page load
updateCalendarUrlDisplay()

// SUBJECT MANAGEMENT

function saveSubjects(){
  localStorage.subjects = JSON.stringify(subjects)
  renderStats()
}

function renderSubjects(){
  console.log('renderSubjects called')
  console.log('subjects array:', subjects)
  const subjectList = document.getElementById("subjectList")
  const editSubject = document.getElementById("editSubject")
  
  console.log('subjectList element:', subjectList)
  console.log('editSubject element:', editSubject)
  
  if(subjectList){
    console.log('subjectList exists, clearing and rendering subjects')
    subjectList.innerHTML = ""
    subjects.forEach((subject, index) => {
      console.log('rendering subject:', subject, 'at index:', index)
      const item = document.createElement("div")
      item.className = "subject-item"
      item.innerHTML = `
        <span>${subject}</span>
        <button onclick="removeSubject(${index})">Remove</button>
      `
      subjectList.appendChild(item)
    })
    console.log('finished rendering subjects to subjectList')
  } else {
    console.log('subjectList element not found!')
  }
  
  // Update edit modal dropdown
  if(editSubject){
    console.log('updating editSubject dropdown')
    editSubject.innerHTML = ""
    subjects.forEach(subject => {
      const option = document.createElement("option")
      option.value = subject
      option.textContent = subject
      editSubject.appendChild(option)
    })
  }
  
  // Update stats page if on stats page
  renderStats()
}

function renderStats(){
  const statsGrid = document.getElementById("statsGrid")
  if(!statsGrid) return
  
  statsGrid.innerHTML = ""
  
  // Count tasks per subject
  const taskCounts = {}
  subjects.forEach(subject => {
    taskCounts[subject] = 0
  })
  
  tasks.forEach(task => {
    if(taskCounts.hasOwnProperty(task.subject)){
      taskCounts[task.subject]++
    }
  })
  
  // Create stat panels for each subject
  subjects.forEach(subject => {
    const count = taskCounts[subject]
    const panel = document.createElement("div")
    panel.className = "panel"
    panel.innerHTML = `
      <h3>${subject.toUpperCase()} TASKS</h3>
      <div>${count}</div>
    `
    statsGrid.appendChild(panel)
  })
}

function addSubject(){
  const newSubjectInput = document.getElementById("newSubject")
  const subject = newSubjectInput.value.trim()
  
  if(!subject) return
  if(subjects.includes(subject)){
    showNotification('Subject already exists', 'warning')
    return
  }
  
  subjects.push(subject)
  saveSubjects()
  renderSubjects()
  newSubjectInput.value = ""
}

function removeSubject(index){
  subjects.splice(index, 1)
  saveSubjects()
  renderSubjects()
}

const addSubjectBtn = document.getElementById("addSubject")
if(addSubjectBtn){
  addSubjectBtn.onclick = addSubject
}

const newSubjectInput = document.getElementById("newSubject")
if(newSubjectInput){
  newSubjectInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") addSubject()
  })
}

// Initialize subjects on page load
renderSubjects()

// Explicitly render stats for stats page
renderStats()

// CSV EXPORT FUNCTIONALITY
function exportTasksToCSV() {
  if (tasks.length === 0) {
    showNotification('No tasks to export', 'warning')
    return
  }

  // Create CSV header
  let csv = 'text,subject,done,description,deadline,startDate\n'
  
  // Add each task as a CSV row
  tasks.forEach(task => {
    // Escape commas and quotes in text fields
    const escapeCSV = (str) => {
      if (!str) return ''
      str = str.toString().replace(/"/g, '""')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str}"`
      }
      return str
    }
    
    csv += `${escapeCSV(task.text)},${escapeCSV(task.subject)},${task.done},${escapeCSV(task.description)},${escapeCSV(task.deadline)},${escapeCSV(task.startDate)}\n`
  })
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // Generate filename with current date
  const date = new Date().toISOString().slice(0, 10)
  link.setAttribute('href', url)
  link.setAttribute('download', `tasks_${date}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  showNotification(`Exported ${tasks.length} tasks to CSV`, 'check_circle')
}

// CSV IMPORT FUNCTIONALITY
function importTasksFromCSV(file) {
  if (!file) return
  
  const reader = new FileReader()
  
  reader.onload = function(e) {
    try {
      const csv = e.target.result
      const lines = csv.split('\n').filter(line => line.trim() !== '')
      
      if (lines.length < 2) {
        showNotification('CSV file is empty or invalid', 'error')
        return
      }
      
      // Parse header
      const headers = lines[0].split(',').map(h => h.trim())
      const expectedHeaders = ['text', 'subject', 'done', 'description', 'deadline', 'startDate']
      
      // Validate headers
      const headerMatch = expectedHeaders.every(header => headers.includes(header))
      if (!headerMatch) {
        showNotification('CSV format is invalid. Expected headers: text, subject, done, description, deadline, startDate', 'error')
        return
      }
      
      // Parse tasks
      const importedTasks = []
      let importCount = 0
      let errorCount = 0
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i])
          
          if (values.length < 6) {
            errorCount++
            continue
          }
          
          const task = {
            text: values[0] || '',
            subject: values[1] || 'General',
            done: values[2] === 'true' || values[2] === 'TRUE',
            description: values[3] || '',
            deadline: values[4] || '',
            startDate: values[5] || new Date().toISOString()
          }
          
          // Validate required fields
          if (!task.text.trim()) {
            errorCount++
            continue
          }
          
          // Validate subject exists or add it
          if (!subjects.includes(task.subject)) {
            subjects.push(task.subject)
            saveSubjects()
            renderSubjects()
          }
          
          importedTasks.push(task)
          importCount++
          
        } catch (error) {
          console.error('Error parsing CSV line:', lines[i], error)
          errorCount++
        }
      }
      
      // Add imported tasks to existing tasks
      if (importCount > 0) {
        tasks.push(...importedTasks)
        save()
        renderTasks()
        renderStats()
        showNotification(`Successfully imported ${importCount} tasks${errorCount > 0 ? ` (${errorCount} errors)` : ''}`, 'check_circle')
      } else {
        showNotification('No valid tasks found in CSV file', 'error')
      }
      
    } catch (error) {
      console.error('Error importing CSV:', error)
      showNotification('Failed to import CSV file', 'error')
    }
  }
  
  reader.onerror = function() {
    showNotification('Failed to read CSV file', 'error')
  }
  
  reader.readAsText(file)
}

// Helper function to parse CSV lines with quoted fields
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// CSV IMPORT/EXPORT EVENT LISTENERS
const exportBtn = document.getElementById('exportTasks')
const importBtn = document.getElementById('importTasks')
const csvFileInput = document.getElementById('csvFileInput')

if (exportBtn) {
  exportBtn.onclick = exportTasksToCSV
}

if (importBtn && csvFileInput) {
  importBtn.onclick = () => {
    csvFileInput.click()
  }
  
  csvFileInput.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showNotification('Please select a CSV file', 'warning')
        return
      }
      importTasksFromCSV(file)
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }
}

// DELETE ALL TASKS FUNCTIONALITY
const deleteAllBtn = document.getElementById('deleteAllTasks')
const deleteAllModal = document.getElementById('deleteAllModal')
const deleteAllForm = document.getElementById('deleteAllForm')
const cancelDeleteAll = document.getElementById('cancelDeleteAll')

function openDeleteAllModal() {
  if (tasks.length === 0) {
    showNotification('No tasks to delete', 'warning')
    return
  }
  deleteAllModal.style.display = 'block'
  const confirmInput = document.getElementById('confirmDeleteAll')
  confirmInput.value = ''
  confirmInput.style.opacity = '1'
  confirmInput.style.fontStyle = 'normal'
  confirmInput.focus()
  
  // Add input event listener to handle placeholder visibility
  confirmInput.oninput = function() {
    if (this.value.length > 0) {
      this.style.opacity = '1'
      this.style.fontStyle = 'normal'
    } else {
      this.style.opacity = '0.5'
      this.style.fontStyle = 'italic'
    }
  }
}

function closeDeleteAllModal() {
  deleteAllModal.style.display = 'none'
}

function deleteAllTasks() {
  const taskCount = tasks.length
  tasks = []
  save()
  renderTasks()
  renderDashboard()
  renderStats()
  closeDeleteAllModal()
  showNotification(`Deleted ${taskCount} tasks`, 'check_circle')
}

if (deleteAllBtn) {
  deleteAllBtn.onclick = openDeleteAllModal
}

if (cancelDeleteAll) {
  cancelDeleteAll.onclick = closeDeleteAllModal
}

if (deleteAllForm) {
  deleteAllForm.onsubmit = (e) => {
    e.preventDefault()
    const confirmationText = document.getElementById('confirmDeleteAll').value.trim()
    if (confirmationText === 'I confirm that I am deleting all my tasks') {
      deleteAllTasks()
    } else {
      showNotification('Incorrect confirmation text', 'error')
    }
  }
}

// DASHBOARD FUNCTIONALITY
function renderDashboard(){
  const taskCountEl = document.getElementById("taskCount")
  const completedCountEl = document.getElementById("completedCount")
  
  if(!taskCountEl && !completedCountEl) return
  
  // Count active and completed tasks
  let activeCount = 0
  let completedCount = 0
  
  tasks.forEach(task => {
    if(task.done) {
      completedCount++
    } else {
      activeCount++
    }
  })
  
  // Update dashboard counts
  if(taskCountEl) taskCountEl.textContent = activeCount
  if(completedCountEl) completedCountEl.textContent = completedCount
}

// Call renderDashboard on load
renderDashboard()

// DASHBOARD DAY VIEW FUNCTIONALITY
class DashboardDayView {
    constructor() {
        this.parser = new ICalParser();
        this.currentDate = new Date();
        this.init();
    }

    init() {
        console.log('=== DASHBOARD DAY VIEW INITIALIZATION ===');
        this.loadCalendar();
    }

    // Determine which day to show (today or tomorrow)
    getTargetDate() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // School day ends at 3 PM (15:00)
        if (currentHour >= 15) {
            // Show tomorrow if school day is over
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log('School day over, showing tomorrow:', tomorrow.toDateString());
            return tomorrow;
        } else {
            // Show today
            console.log('School day ongoing, showing today:', now.toDateString());
            return now;
        }
    }

    // Load calendar and render day view
    async loadCalendar() {
        console.log('=== LOAD CALENDAR START ===');
        
        const savedUrl = localStorage.calendarUrl;
        console.log('Saved URL found:', savedUrl);
        
        if (!savedUrl) {
            console.log('No saved URL, showing empty day view');
            this.showEmptyDayView('No calendar set. Add calendar URL in settings.');
            return;
        }

        try {
            console.log('Starting calendar fetch...');
            console.log('Parser created:', !!this.parser);
            
            // Show loading message
            const contentElement = document.getElementById('dayViewContent');
            if (contentElement) {
                contentElement.innerHTML = '<div class="loading-message">Loading classes...</div>';
            }
            
            console.log('Fetching from URL:', savedUrl);
            const events = await this.parser.fetchFromURL(savedUrl);
            console.log('Fetch completed, events returned:', events);
            console.log('Parser loaded status:', this.parser.loaded);
            console.log('Parser events count:', this.parser.events.length);
            
            console.log('Now rendering day view...');
            this.renderDayView();
            
        } catch (error) {
            console.error('=== LOAD CALENDAR ERROR ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            this.showEmptyDayView('Failed to load calendar. Check your calendar URL.');
        }
        
        console.log('=== LOAD CALENDAR END ===');
    }

    // Render day view
    renderDayView() {
        const targetDate = this.getTargetDate();
        const dayEvents = this.parser.getDayEvents(targetDate);
        
        // Update title
        const titleElement = document.getElementById('dayViewTitle');
        const now = new Date();
        const isToday = targetDate.toDateString() === now.toDateString();
        
        if (isToday) {
            titleElement.textContent = "TODAY'S CLASSES";
        } else {
            titleElement.textContent = "TOMORROW'S CLASSES";
        }

        // Sort events by start time
        dayEvents.sort((a, b) => {
            const timeA = new Date(a.start).getTime();
            const timeB = new Date(b.start).getTime();
            return timeA - timeB;
        });

        // Render events
        const contentElement = document.getElementById('dayViewContent');
        
        if (dayEvents.length === 0) {
            const message = isToday ? 'No classes today.' : 'No classes tomorrow.';
            this.showEmptyDayView(message);
            return;
        }

        let html = '';
        dayEvents.forEach(event => {
            const startTime = new Date(event.start);
            const endTime = new Date(event.end);
            
            const startTimeString = window.formatTime ? window.formatTime(startTime) : 
                startTime.toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                
            const endTimeString = window.formatTime ? window.formatTime(endTime) : 
                endTime.toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

            html += `
                <div class="day-event">
                    <div class="event-time">${startTimeString} - ${endTimeString}</div>
                    <div class="event-subject">${event.summary}</div>
                    ${event.attendingStaff ? `<div class="event-staff">Staff: ${event.attendingStaff}</div>` : ''}
                    ${event.location ? `<div class="event-location">Room: ${event.location}</div>` : ''}
                </div>
            `;
        });

        contentElement.innerHTML = html;
        console.log(`Dashboard day view rendered: ${dayEvents.length} classes for ${isToday ? 'today' : 'tomorrow'}`);
    }

    // Show empty day view
    showEmptyDayView(message) {
        const contentElement = document.getElementById('dayViewContent');
        contentElement.innerHTML = `<div class="empty-day-message">${message}</div>`;
    }
}

// Initialize dashboard day view
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED - CHECKING FOR DASHBOARD ===');
    console.log('Current pathname:', window.location.pathname);
    console.log('Current href:', window.location.href);
    
    // Only initialize on dashboard page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log('Dashboard detected, initializing day view...');
        
        // Check if required elements exist
        const dayViewTitle = document.getElementById('dayViewTitle');
        const dayViewContent = document.getElementById('dayViewContent');
        
        console.log('Day view elements found:', {
            title: !!dayViewTitle,
            content: !!dayViewContent
        });
        
        if (dayViewTitle && dayViewContent) {
            window.dashboardDayView = new DashboardDayView();
        } else {
            console.error('Day view elements not found on dashboard');
        }
    } else {
        console.log('Not on dashboard page, skipping day view initialization');
    }
});