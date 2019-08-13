// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 

const ul = document.querySelector("#quote-list")
const form = document.querySelector("#new-quote-form")
const sort_button = document.querySelector("#sort_authors")
const likes_sort_button = document.querySelector("#sort_likes")

let qlist = []

document.addEventListener("DOMContentLoaded", () => {

	draw_from_db()

	sort_button.addEventListener("click", () => {
		if (sort_button.innerText == "Sort by authors")
		{
			qlist = qlist.sort((a, b) => (a.author > b.author) ? 1 : -1)
			draw_list(qlist)
			sort_button.innerText = "Unsort"
		}else{
			
			draw_from_db()
			sort_button.innerText = "Sort by authors"

		}		

	})

	likes_sort_button.addEventListener("click", () => {
		if (likes_sort_button.innerText == "Sort by likes")
		{
			qlist = qlist.sort((a, b) => (a.likes.length > b.likes.length) ? -1 : 1)
			draw_list(qlist)
			likes_sort_button.innerText = "Unsort"
		}else{
			
			draw_from_db()
			likes_sort_button.innerText = "Sort by likes"

		}		

	})

	form.addEventListener("submit", e => {
		e.preventDefault()
		
		if (e.target.children[2].innerText == "Submit")
		{
			fetch("http://localhost:3000/quotes", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify({
					quote: e.target[0].value,
					author: e.target[1].value
				})
			})
			.then(res => res.json())
			.then(json => {
				qlist.push({id:json.id, quote: e.target[0].value, author: e.target[1].value, likes: []})
				draw_list(qlist)
				e.target[0].focus()
				form.reset()
			})
		} else {
			make_new_form()
			let quote_id = e.target.children[2].getAttribute("quote_id")
			//console.log(e.target.children[2].getAttribute("quote_id"))
			fetch(`http://localhost:3000/quotes/${quote_id}`, {
				method:"PATCH",
				headers:{
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body:JSON.stringify({
					quote: e.target[0].value,
					author: e.target[1].value
				})
			})
			.then(res => res.json())
			.then(json => {
				find_quote(json).quote = json.quote
				find_quote(json).author = json.author

				console.log(find_quote(json))
				draw_list(qlist)
				e.target[0].focus()
				form.reset()
			})
		}

		
	})
})

function draw_list(qlist) {
	ul.innerHTML = ""
	qlist.forEach(quote => {
		ul.append(li_create(quote))
	})
}
function li_create(quote) {
	const li = document.createElement("li")
	li.className = "quote-card"

	const bq = document.createElement("blockquote")
	bq.className = "blockquote"

	const p = document.createElement("p")
	p.className = `mb-${quote.id}`
	p.innerText = quote.quote

	const footer = document.createElement("footer")
	footer.className = "blockquote-footer"
	footer.innerText = quote.author

	const br = document.createElement("br")

	const success_button = document.createElement("button")
	success_button.className = "btn-success"
	success_button.innerHTML = `Likes: <span>${quote.likes.length}</span>`

	success_button.addEventListener("click", () => {
		var create = Date.now();
		console.log(create)
		fetch("http://localhost:3000/likes", {
			method:"POST",
			headers:{
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body:JSON.stringify({
				"quoteId": quote.id,
				"createdAt": create
			})
		})
		.then(res => res.json())
		.then(json => {
			console.log(json)
			quote.likes.push(json)
			//draw_list(qlist)
			success_button.innerHTML = `Likes: <span>${quote.likes.length}</span>`
		})
	})

	const delete_button = document.createElement("button")
	delete_button.className = 'btn-danger'
	delete_button.innerText = "Delete"

	delete_button.addEventListener("click", () => {
		fetch(`http://localhost:3000/quotes/${quote.id}`, {method: "DELETE"})
		.then(res => {
			del_list(quote)
			const sibl = delete_button.closest("li").children[0].children[3]
			console.log(sibl)
			draw_list(qlist)
			sibl.focus()
		})
	})

	const edit_button = document.createElement("button")
	edit_button.className = "btn-warning"
	edit_button.innerHTML = "Edit"

	edit_button.addEventListener('click', ()=>{
		make_edit_form(quote)
	})


	bq.append(p, footer, br, success_button, delete_button, edit_button)
	li.append(bq)
	return li
}

function del_list(quote) {
	qlist = qlist.filter(q => q.id != quote.id);
}

function make_edit_form(quote) {
	form.children[0].children[0].innerText = "Edit the quote"

	form.children[0].children[1].value = quote.quote

	form.children[1].children[1].value = quote.author
	form.children[2].innerText = "Save Edit"
	form.children[2].setAttribute("quote_id", quote.id )
	form.children[2].focus()
}
function make_new_form() {
	form.children[0].children[0].innerText = "New Quote"
	form.children[2].innerText = "Submit"	
}
function find_quote(quote) {
	return qlist.find(function(element) {
  		return element.id == quote.id;
	});
}
function draw_from_db() {
	fetch("http://localhost:3000/quotes?_embed=likes")
		.then(res => res.json())
		.then(json => {
			console.log(json)
			qlist = json
			draw_list(qlist)
		})
}




















