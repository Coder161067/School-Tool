// =====================
// LIVE CLOCK (non-blocking)
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const clock = document.getElementById("clock");
  if (!clock) return;

  // Initialize clock immediately
  clock.textContent = new Date().toLocaleTimeString();

  // Update every second
  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString();
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

// Set default deadline to current day if task doesn't have one
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
showNotification('Subject is required', '⚠')
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
document.getElementById("confirmDelete").value=""

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
showNotification('Task name does not match. Please type the exact task name to confirm deletion.', '⚠')
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
      showNotification('Task discarded', '🗑️')
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
function showNotification(message, icon = "ℹ") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = "notification"
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${icon}</span>
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

// SETTINGS POPOUT MENU
const gearIcon = document.getElementById("gearIcon")
const settingsMenu = document.getElementById("settingsMenu")

function toggleSettingsMenu() {
  console.log('Toggling settings menu')
  settingsMenu.classList.toggle("show")
}

function closeSettingsMenu() {
  console.log('Closing settings menu')
  settingsMenu.classList.remove("show")
  // Reset to main settings view
  showMainSettingsView()
}

if (gearIcon) {
  gearIcon.onclick = (e) => {
    e.stopPropagation()
    toggleSettingsMenu()
  }
}

// SETTINGS VIEW NAVIGATION
const mainSettingsView = document.getElementById("mainSettingsView")
const subjectsView = document.getElementById("subjectsView")
const subjectsManagementBtn = document.getElementById("subjectsManagementBtn")
const backToMain = document.getElementById("backToMain")

function showSubjectsView() {
  console.log('Showing subjects view')
  mainSettingsView.classList.add("hidden")
  subjectsView.classList.remove("hidden")
}

function showMainSettingsView() {
  console.log('Showing main settings view')
  subjectsView.classList.add("hidden")
  mainSettingsView.classList.remove("hidden")
}

if (subjectsManagementBtn) {
  subjectsManagementBtn.onclick = showSubjectsView
}

if (backToMain) {
  backToMain.onclick = showMainSettingsView
}

// SUBJECT MANAGEMENT

function saveSubjects(){
  localStorage.subjects = JSON.stringify(subjects)
  renderStats()
}

function renderSubjects(){
  const subjectList = document.getElementById("subjectList")
  const editSubject = document.getElementById("editSubject")
  
  if(subjectList){
    subjectList.innerHTML = ""
    subjects.forEach((subject, index) => {
      const item = document.createElement("div")
      item.className = "subject-item"
      item.innerHTML = `
        <span>${subject}</span>
        <button onclick="removeSubject(${index})">Remove</button>
      `
      subjectList.appendChild(item)
    })
  }
  
  // Update edit modal dropdown
  if(editSubject){
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
    showNotification('Subject already exists', '⚠')
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