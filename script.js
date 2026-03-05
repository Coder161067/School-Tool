// CLOCK
const clock=document.getElementById("clock")

if(clock){
setInterval(()=>{
clock.textContent=new Date().toLocaleTimeString()
},1000)
}


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
done:false
}

tasks.push(task)

save()

renderTasks()

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


let del=document.createElement("button")
del.className="delete-btn"
del.textContent="DELETE"

del.onclick=()=>{
tasks.splice(i,1)
save()
renderTasks()
}


actions.appendChild(done)
actions.appendChild(del)

task.appendChild(info)
task.appendChild(actions)

list.appendChild(task)

})

}

renderTasks()