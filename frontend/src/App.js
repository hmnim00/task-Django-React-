import React from 'react'
import './App.css';

class App extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			todoList:[],
			activeItem: {
				id: null,
				title: '',
				status:false,
			},
			editing: false,
		}
		this.fetchTasks = this.fetchTasks.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.getCookie = this.getCookie.bind(this)
		
		this.startEdit = this.startEdit.bind(this)
		this.deleteItem = this.deleteItem.bind(this)
		this.strikeUnstrike = this.strikeUnstrike.bind(this)
	}

	getCookie(name) {
		var cookieValue = null
		if(document.cookie && document.cokkie !== '') {
			var cookies = document.cookie.split(';')
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim()
				if(cookie.substring(0, name.length + 1) === (name + '=')) {
					// cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
					break;
				}
			}
		}
	}

	componentWillMount() {
		this.fetchTasks()
	}

	fetchTasks() {
		fetch('http://127.0.0.1:8000/api/task-list/')
			.then(res => res.json())
			.then(data => {
				this.setState({
					todoList: data
				})
			})
	}

	handleChange(e) {
		// var name = e.target.name // Name of the input field
		var value = e.target.value
		this.setState({
			// 
			activeItem: {
				...this.state.activeItem,
				title: value
			}
		})
		// console.log('Name: ',name,' Value: ', value)
	}

	handleSubmit(e) {
		e.preventDefault()
		console.log('ITEM', this.state.activeItem)

		var csrfToken = this.getCookie('csrftoken')

		// Post data
		var url = 'http://127.0.0.1:8000/api/task-create/'

		if(this.state.editing === true) {
			url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
			this.setState({
				editing: false
			})
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				'X-CSRFToken': csrfToken
			},
			body: JSON.stringify(this.state.activeItem)
		}).then(res => {
			this.fetchTasks()
			this.setState({
				activeItem: {
					id: null,
					title: '',
					status:false,
				},
			})
		}).catch(err => console.log(err))
	}

	startEdit(task) {
		this.setState({
			activeItem: task,
			editing: true
		})
	}


	strikeUnstrike(task) {
		task.status = !task.status

		var csrfToken = this.getCookie('csrftoken')
		var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			body: JSON.stringify({'status':task.status, 'title': task.title})
		}).then(() => {
			this.fetchTasks()
		})
		console.log('Task: ', task.status)
	}


	deleteItem(task) {
		var csrfToken = this.getCookie('csrftoken')
		var url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`
		fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-type': 'application/json',
				'X-CSRFToken': csrfToken
			},
		}).then(res => {
			this.fetchTasks()
		})
	}

	render() {
		// Loop
		var tasks = this.state.todoList
		var self = this
		return(
			<div className="container">
				<div id="task-container">
					<div id="form-wrapper">
						<form onSubmit={this.handleSubmit} id="form">
							<div className="flex-wrapper">
								<div style={{flex: 6}}>
									{/* On change */}
									<input onChange={this.handleChange} className="form-control" id="title" type="text" value={this.state.activeItem.title} name="title" placeholder="Task title"></input>
								</div>
								<div style={{flex: 1}}>
									<input id="submit" className="btn btn-warning" type="submit" name="Add"></input>
								</div>
							</div>
						</form>
					</div>
					<div id="list-wrapper">
						{tasks.map(function(task, index) {
							return (
								<div key={index} className="task-wrapper flex-wrapper">
									<div onClick={() => self.strikeUnstrike(task) } style={{flex: 7}}>
										{task.status === false ? (
											<span>{task.title}</span>
										) : (
											<strike>{task.title}</strike>
										)}
									</div>
									<div style={{flex: 1}}>
										<button onClick={() => self.startEdit(task) } className="btn btn-sm btn-outline-info">Edit</button>
									</div>
									<div style={{flex: 1}}>
									<button onClick={() => self.deleteItem(task) } className="btn btn-sm btn-outline-dark delete">Delete</button>
									</div>
									
								</div>
							)
						})}
					</div>
				</div>
			</div>
		)
	}
}

export default App;
