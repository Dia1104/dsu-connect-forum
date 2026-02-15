loadPosts();

function loadPosts(){
fetch("/myprofile")
.then(res=>res.json())
.then(data=>{
  if(data.user){
    document.getElementById("username").innerText =
      "👤 " + data.user.name;
  }
});
fetch("/posts")
.then(res=>res.json())
.then(data=>{
  const feed=document.getElementById("feed");
  feed.innerHTML="";

  data.forEach(post=>{
    let mediaHTML="";

    if(post.media){
      const ext=post.media.split(".").pop().toLowerCase();

      if(["jpg","jpeg","png"].includes(ext))
        mediaHTML=`<img src="/uploads/${post.media}">`;

      else if(ext==="mp4")
        mediaHTML=`<video controls src="/uploads/${post.media}"></video>`;

      else if(ext==="pdf")
        mediaHTML=`<a href="/uploads/${post.media}" target="_blank">📄 View PDF</a>`;
    }
const html=`
<div class="post">

  <b>${post.name}</b>
  <p>${post.content}</p>
  ${mediaHTML}

  <button onclick="upvote(${post.id})">⬆️ ${post.votes||0}</button>

  <div class="comments">
    <input id="c${post.id}" placeholder="Write comment">
    <button onclick="sendComment(${post.id})">Send</button>
    <div id="comments${post.id}"></div>
  </div>

</div>
`;


    feed.innerHTML+=html;
    loadComments(post.id);
  });
});
}

function upvote(id){
fetch("/upvote/"+id,{method:"POST"})
.then(()=>loadPosts());
}

function sendComment(id){
const text=document.getElementById("c"+id).value;

fetch("/comment",{
method:"POST",
headers:{"Content-Type":"application/x-www-form-urlencoded"},
body:`post_id=${id}&text=${text}`
})
.then(()=>{
document.getElementById("c"+id).value="";
loadComments(id);
});
}

function loadComments(id){
fetch("/comments/"+id)
.then(res=>res.json())
.then(data=>{
let html="";
data.forEach(c=>{
html+=`
<div style="
background:#f1f5f9;
color:black;
padding:6px;
border-radius:8px;
margin-top:6px">
<b>${c.name}</b>: ${c.text}
</div>
`;
});
document.getElementById("comments"+id).innerHTML=html;
});
}

function searchPosts(){
const val=document.getElementById("search").value.toLowerCase();
document.querySelectorAll(".post").forEach(p=>{
p.style.display=p.innerText.toLowerCase().includes(val)?"block":"none";
});
}
