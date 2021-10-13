const list = document.querySelector('ul');
const form = document.querySelector('form');
const button = document.querySelector('button');
const searchbar = document.querySelector('#searchbar');
const filter = document.querySelector('#filter');
const update_form = document.querySelector('#update_form');

const addNote = (note, id) => {
    let timestamp = note.date.toDate();
    let date = new Date(timestamp);

    date = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate()

    let check = 'Not important';
    if(note.important) {
        check = 'Important';
    };

    let html = `
    <li data-id="${id}" class="note">
        <div>${note.title}</div>
        <div>${note.body}</div>
        <div>${date}</div>
        <div>${check}</div>
        <button class="btn btn-danger btn-sm my-2">delete</button>
        <button class="btn btn-info btn-sm my-2">update</button>
    </li>
    `;
    list.innerHTML += html;
};

const deleteNote = (id) => {
    const notes = document.querySelectorAll('li');
    notes.forEach(note => {
        if(note.getAttribute('data-id') === id){
            note.remove();
        }
    });
};

//real time listener
db.collection('notes').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const doc = change.doc;

        if(change.type === 'added'){
            addNote(doc.data(),doc.id);
        } else if (change.type === 'removed'){
            deleteNote(doc.id);
        } else if(change.type === "modified"){
            updateNote(doc.data(), doc.id);
        }
    });
});

//Update note function
const updateNote = (data, id) => {

    let notes = document.querySelectorAll(".note");

    notes.forEach(note => {
        if(note.getAttribute('data-id') == id){

            note.childNodes[1].innerText = data.title;
            note.childNodes[3].innerText = data.body;

            if(data.important == true){
                note.childNodes[7].innerText = "Important";
            } else{
                note.childNodes[7].innerText = "Not important";
            }
        }
    })
}

//add documents
form.addEventListener('submit', e => {
    e.preventDefault(); 
    let check = false;
    if(form.checkbox.checked){
        check = true;
    };

    const now = new Date();
    const note = {
        title: form.title.value,
        date: firebase.firestore.Timestamp.fromDate(now),
        body: form.body.value,
        important: check
    };

    db.collection('notes').add(note).then(() => {
        alert('Note added');
    }).catch(err => {
        console.log(err);
    })
});

//List Eventlistener
list.addEventListener('click', e => {
    if(e.target.innerText === 'delete'){ //if the tag is a button
        const id = e.target.parentElement.getAttribute('data-id');
        db.collection('notes').doc(id).delete().then(()=> {
            alert('Note deleted');
        });
    } else if(e.target.innerText === 'update'){
        const id = e.target.parentElement.getAttribute('data-id');
        
        db.collection("notes").doc(id).get().then((doc) => {
            document.getElementById("update_id").value = id;
            document.getElementById("update_title").value = doc.data().title;
            document.getElementById("update_body").value = doc.data().body;
            document.getElementById("update_important").checked = doc.data().important;
        });
    }
});

//Update submit
update_form.addEventListener("submit", e => {
    e.preventDefault(); 

    const id = document.getElementById("update_id").value;

    db.collection("notes").doc(id).update({
        title: update_title.value,
        body: update_body.value,
        important: update_important.checked
    }).then(()=>{
        alert("updated");
    }).catch(err => {
        console.log(err)
    })
})

//searchbar
searchbar.addEventListener("input", () => {
    let notes = document.querySelectorAll(".note");
    let term = searchbar.value.toLowerCase();
    notes.forEach(note => {
        let note_title = note.childNodes[1].innerText.toLowerCase();
        if(note_title.includes(term)){
            note.classList.remove("d-none")
        } else{
            note.classList.add("d-none")
        }
    });
});

//filter
filter.addEventListener('change', () => {
    let notes = document.querySelectorAll(".note");
    if(filter.checked == true){
        notes.forEach(note => {
            if(note.childNodes[7].innerText != 'Important'){
                note.classList.add("d-none");
            }
        })
    }else{
        notes.forEach(note =>{
            note.classList.remove("d-none");
        })
    }
});