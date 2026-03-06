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
const toggle=document.getElementById("themeToggle")

if(localStorage.theme==="dark"){
document.body.classList.add("dark")
}

if(toggle){
toggle.onclick=()=>{
document.body.classList.toggle("dark")

localStorage.theme=document.body.classList.contains("dark")
? "dark"
: "light"
}
}


// TASK STORAGE
let tasks=JSON.parse(localStorage.tasks||"[]")

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

let text=input.value.trim()

if(!text) return

let task={
text:text,
subject:subjectSelect.value,
done:false,
description:"",
deadline:"",
startDate:new Date().toISOString()
}

tasks.push(task)

save()

renderTasks()

// Auto-open edit modal for the newly created task
const newTaskIndex=tasks.length-1
console.log('Auto-opening edit modal for new task at index:', newTaskIndex)
openEditModal(newTaskIndex)

input.value=""
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
tasks.splice(i,1)
save()
renderTasks()
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
document.getElementById("editDescription").value=task.description||""
document.getElementById("editDeadline").value=task.deadline||""

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
cancelEdit.onclick=closeEditModal
}

if(editForm){
console.log('Setting up form submission handler')
editForm.onsubmit=(e)=>{
e.preventDefault()
console.log('Form submitted for task index:', currentEditIndex)

if(currentEditIndex===-1) return

const task=tasks[currentEditIndex]
task.text=document.getElementById("editName").value
task.description=document.getElementById("editDescription").value
task.deadline=document.getElementById("editDeadline").value

console.log('Updated task:', task)
save()
renderTasks()
closeEditModal()
}
}

// Close modal when clicking outside
window.onclick=(event)=>{
if(event.target===editModal){
console.log('Clicked outside modal, closing')
closeEditModal()
}
}