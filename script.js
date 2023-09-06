function API() {
    var Todos = {
        title: "todos",
        todoList: [],

        createTodo: function (options) {
            return new Promise((resolve, reject) => {
                let { description } = options
                let isCompleted = false
                let created = Date.now()
                let id = String(Date.now() | (Math.round(Math.random() * 1000000000)))
                
                if(description == "") {
                    throw new Error("Пустое значение")
                }
                const todoItem = {
                    description: description,
                    isCompleted,
                    created,
                    dateIsComplete: null,
                    id
                }
                Array.prototype.push.call(this.todoList, todoItem)

                resolve(todoItem)
            })
        },

        deleteTodo: function (id) {
            return new Promise((resolve, reject) => {

                if (typeof id === undefined || typeof id === null) reject("id не должен быть равен undefined ")

                const index = this.todoList.findIndex(item => item.id == id)

                if (index == -1) reject("Нет такого элемента с таким индексом")

                resolve(this.todoList.splice(index, 1))
            })
        },

        changeTodo: function (id, desc) {
            return new Promise((resolve, reject) => {
                const index = this.todoList.findIndex(item => item.id == id)

                if (index == -1) reject("Нет такого элемента с таким индексом")

                this.todoList[index].description = desc
                resolve(this.todoList[index])
            })
        },

        ToggleIsComplete: function (id) {
            return new Promise((resolve, reject) => {
                const index = this.todoList.findIndex(item => item.id == id)
                this.todoList[index].isCompleted = !this.todoList[index].isCompleted
                this.todoList[index].dateIsComplete = Date.now()

                resolve(this.todoList[index])
            })
        },

        clearTodoList: function () {
            this.todoList = []
        },

        showList: function () {
            if (this.todoList.length == 0) {
                return Promise.reject("Нет элементов")
            }
            return Promise.resolve(this.todoList)
        },

        getActivatedTodos: function () {
            return new Promise((resolve, reject) => {
                this.showList()
                const activatedList = this.todoList.filter(item => item.isCompleted == false)
                console.log(activatedList)
                resolve(activatedList)
            })
        },

        getCompletedTodos: function () {
            return new Promise((resolve, reject) => {
                const completed = this.todoList.filter(item => item.isCompleted == true)
                resolve(completed)
            })
        },

        exportTodos: function () {
            return new Promise((resolve, reject) => {
                try {
                    const json = JSON.stringify(this.todoList)
                    resolve(json)
                }
                catch (error) {
                    reject(error)
                }
            })

        },

        importTodos: function(str) {
            return new Promise((resolve, reject) => {
                if (typeof str == "undefined") reject("Ошибка")

                try {
                    this.todoList = JSON.parse(str)
                    resolve(this.todoList)
                } catch (err) {
                    reject(new SyntaxError("Ошибка парсинга."))
                }
            })
        }
    }

    return {
        create: Todos.createTodo.bind(Todos),
        change: Todos.changeTodo.bind(Todos),
        delete: Todos.deleteTodo.bind(Todos),
        clearTodoList: Todos.clearTodoList.bind(Todos),
        ToggleIsComplete: Todos.ToggleIsComplete.bind(Todos),
        getActivatedTodos: Todos.getActivatedTodos.bind(Todos),
        getCompletedTodos: Todos.getCompletedTodos.bind(Todos),
        exportTodos: Todos.exportTodos.bind(Todos),
        importTodos: Todos.importTodos.bind(Todos),
        getAllTodos: Todos.showList.bind(Todos)
    }
}

const api = API()



const createBtn = document.querySelector(".btn-create")
const inputDescription = document.querySelector(".todo__inp")
const dom_todoList = document.querySelector(".todo__items")
const todoExport = document.querySelector(".todo_export")
const btmFilterActive = document.querySelector(".todo__isActivedItems")
const btn__CompletedItems = document.querySelector(".todo__CompletedItems")
const btn__todo_import = document.querySelector(".todo_import")
const todo__allItems = document.querySelector(".todo__allItems")
const filterButtons = document.querySelectorAll(".todo__filterBtn")

createBtn.addEventListener("click", createBtnHandler)
todoExport.addEventListener('click', todoExportHandler)
inputDescription.addEventListener("keyup", inputDescriptionHandler)
btmFilterActive.addEventListener("click", filterActivetedHandler)
btn__CompletedItems.addEventListener("click", filterCompletedHandler)
btn__todo_import.addEventListener("change", importHandler)
todo__allItems.addEventListener("click", filterAllTodosHandler)

function inputDescriptionHandler(e) {
    if(e.key == "Enter") {
        createBtnHandler()
    }
}

function createBtnHandler(e) {
    const description = inputDescription.value
    // if (description == "") {
    //     alert("Заполните поле")
    //     return
    // }

    api.create({
        description
    })
        .then(data => {
            createDOM_item(data)
            inputDescription.value = ""
        })
        .catch(error => {
            alert(error.message)
        })
}

function createDOM_item(data) {
    const html =
        `
    <li class="todo__item" id=${data.id}>
        <input type="checkbox" ${data.isActive ? "cheked" : ""}>
        <p class="todo__description">${data.description}</p>
        <button class="todo__change btn btn-change">Изменить</button>
        <button class="todo__delete btn btn-danger">Удалить</button>
    </li>
    `
    let todoItem = document.createElement("li")
    todoItem.classList.add("todo__item")
    todoItem.setAttribute("id", data.id)

    let todo__input = document.createElement('input')

    todo__input.addEventListener("change", function (e) {
        const id = this.parentNode.getAttribute("id")

        api.ToggleIsComplete(id)
            .then(todo => {
                console.log(todo)
                console.log(this.checked)
                this.checked
                    ? this.parentNode.querySelector("p").classList.add("completed")
                    : this.parentNode.querySelector("p").classList.remove("completed")

            })

    })

    todo__input.setAttribute("type", "checkbox")


    let description = document.createElement("p")
    description.classList.add("todo__description")
    description.innerHTML = `
        ${data.description} \n<p class='todo__created'>${new Date(data.created).toLocaleString()}</p>
    `

    if(data.isCompleted) {
        todo__input.setAttribute("checked", "checked")
        description.classList.add("completed")
    } else {
        todo__input.removeAttribute("checked")
        description.classList.remove("completed")
    }

    let createdPElem = document.createElement("p")

    createdPElem.textContent = 
    createdPElem.classList.add("todo__created")

    let btnDelete = document.createElement("button")
    btnDelete.classList.add("todo__change", "btn", "btn-danger")
    btnDelete.textContent = "Удалить"
    btnDelete.addEventListener("click", deleteITem)

    todoItem.append(todo__input, description, btnDelete)

    document.querySelector(".todo__items").appendChild(todoItem)

    function deleteITem() {
        const todoId = this.parentNode.getAttribute("id")

        api.delete(todoId)
            .then(elem => {
                this.parentNode.remove()
            })
    }
}

async function todoExportHandler(e) {
    const json = await api.exportTodos()
    let blob = new Blob([json], { type: 'text/plain' });
    todoExport.href = URL.createObjectURL(blob);
}

function filterActivetedHandler() {
    dom_todoList.innerHTML = ''
    api.getActivatedTodos()
        .then(todos => {
            todos.map(todo => {
                createDOM_item(todo)
            })
            setActiveClass.call(this)
        })
}

function filterCompletedHandler() {
    dom_todoList.innerHTML = ''
    api.getCompletedTodos()
        .then(todos => {
            todos.map(todo => {
                createDOM_item(todo)
            })
            setActiveClass.call(this)

        })
}

function importHandler(e) {
    const file = this.files[0]
    const reader = new FileReader()
    reader.readAsText(file)

    reader.onload = function() {
        api.importTodos(reader.result)
            .then(todos => {
                todos.map(todo => {
                    createDOM_item(todo)
                })
            }).catch(err => {
                console.log(err.message)
            })

    }

    reader.onerrorerror = function() {
        console.error(reader.error)
    }
}

function filterAllTodosHandler() {
    dom_todoList.innerHTML = ''
    api.getAllTodos()
        .then(todos => {
            todos.map(todo => createDOM_item(todo))
            setActiveClass.call(this)
        })
        .catch(error => {
            console.error(error)
        })
}

function setActiveClass() {
    filterButtons.forEach(button => {
        button.classList.remove("active")
    })
    this.classList.add("active")
}


