// LOAD POSTS
fetch("/posts")
.then(res => res.json())
.then(posts => {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts.forEach(post => {

    let mediaHTML = "";
    if(post.media){
      const ext = post.media.split(".").pop().toLowerCase();

      if(["jpg","jpeg","png"].includes(ext)){
        mediaHTML = `<img src="/uploads/${post.media}" style="max-width:300px">`;
      }
      else if(ext==="mp4"){
        mediaHTML = `<video controls width="300" src="/uploads/${post.media}"></video>`;
      }
      else if(ext==="pdf"){
        mediaHTML = `<a href="/uploads/${post.media}" target="_blank">📄 View PDF</a>`;
      }
    }

    const html = `
      <div class="card post">
        <h4>${post.name}</h4>
        <p>${post.content}</p>
        ${mediaHTML}

        <button onclick="upvote(${post.id})">⬆️ ${post.votes || 0}</button>

        <div class="comments">
          <input id="c${post.id}" placeholder="Write comment">
          <button onclick="sendComment(${post.id})">Send</button>
          <div id="comments${post.id}"></div>
        </div>
      </div>
    `;

    feed.innerHTML += html;

    loadComments(post.id);
  });
});


// UPVOTE
function upvote(id){
  fetch("/upvote/"+id,{method:"POST"})
  .then(()=> location.reload());
}


// SEND COMMENT
function sendComment(postId){
  const text = document.getElementById("c"+postId).value;

  fetch("/comment",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`post_id=${postId}&text=${text}`
  })
  .then(()=>{
    loadComments(postId);
    document.getElementById("c"+postId).value="";
  });
}


// LOAD COMMENTS
function loadComments(postId){
  fetch("/comments/"+postId)
  .then(res=>res.json())
  .then(data=>{
    const div = document.getElementById("comments"+postId);
    div.innerHTML="";

    data.forEach(c=>{
      div.innerHTML += `<p><b>${c.name}</b>: ${c.text}</p>`;
    });
  });
}
