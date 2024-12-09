var b=Object.defineProperty;var E=(o,e,t)=>e in o?b(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var a=(o,e,t)=>E(o,typeof e!="symbol"?e+"":e,t);import{H as y}from"./global-DUEV-DhV.js";const C=Object.freeze({CHATS_CONTAINER:"CHATS_CONTAINER",CHAT_EDITOR:"CHAT_EDITOR"}),l=class l{constructor(){a(this,"chats");a(this,"currentUser",null);a(this,"chatsIds");a(this,"observers");this.observers=[],this.chats=[],this.chatsIds=[]}static getInstance(){return l.instance||(l.instance=new l),l.instance}getCurrentUser(){return structuredClone(this.currentUser)}setCurrentUser(e){this.currentUser=e}addChat(e){this.chats.find(s=>s.id===e.id)||(this.chatsIds=[...this.chatsIds,e.id],this.chats=[e,...this.chats],this.notify({subscriberId:C.CHATS_CONTAINER,data:this.chats}))}updateActiveChat(e){(this.chatsIds.includes(e)||e===null)&&this.notify({subscriberId:C.CHAT_EDITOR,data:{id:e}})}notify(e){this.observers.forEach(t=>{typeof t.update=="function"?t.update(e):console.warn("Observer does not have an update method:",t)})}subscribe(e){this.observers.push(e)}};a(l,"instance",null);let d=l;const w=d.getInstance(),v=o=>{var s;const e=o,t=w.getCurrentUser();if(!t)return null;if(e.initial="GP",((s=o.type)==null?void 0:s.name)==="direct"){const n=e.members.find(i=>i.name!==t.name);if(!n)return null;e.members=n?[n]:[],e.name=n.name,e.avatarUrl=n.avatarUrl,e.initial=void 0}return e};class L{constructor(e,t){a(this,"chatsContainer");a(this,"refineInput");a(this,"chats");a(this,"refineString");a(this,"stateStore");a(this,"httpRequestManager");a(this,"renderUI",()=>{const e=this.chats.filter(t=>this.refineString.trim()?t.name.includes(this.refineString):!0);this.chatsContainer.innerHTML="",e.map(t=>{const{id:s,name:n,initial:i,avatarUrl:r}=t,c=this.createChatItem({name:n,initial:i,avatarUrl:r});return c.addEventListener("click",()=>{this.stateStore.updateActiveChat(s),this.chatsContainer.querySelectorAll(".user-chat-item-active").forEach(h=>{h.classList.remove("user-chat-item-active")}),c.classList.add("user-chat-item-active")}),this.chatsContainer&&this.chatsContainer.appendChild(c),c})});this.stateStore=e,this.httpRequestManager=t,this.chats=[],this.refineString="",this.chatsContainer=document.getElementById("chats-container"),this.refineInput=document.getElementById("refine-input"),this.chatsContainer.innerHTML="",this.refineInput.addEventListener("input",s=>{var i;const n=s.target;this.refineString=((i=n.value)==null?void 0:i.trim())??"",this.renderUI()})}update(e){this.getUserChats()}createChatItem({name:e,initial:t,avatarUrl:s,messageTime:n,messageValue:i}){const r=document.createElement("button");return r.className="user-chat-item",r.tabIndex=0,t&&(r.innerHTML=`
      <div class="user-chat-item-avatar user-chat-item-initial">${t}</div>
      <div class="user-chat-item-details">
        <div class="user-chat-item-header">
          <h4>
            ${e??"Unknown"}
          </h4>
          <span class="time">
            ${n??"0s"}
          </span>
        </div>
        <p class="last-message">
          ${i??"Start new conversation"}
        </p>
      </div>
    `),s&&(r.innerHTML=`
      <img src="${s}" alt="Contact" class="user-chat-item-avatar" />
      <div class="user-chat-item-details">
        <div class="user-chat-item-header">
          <h4>
            ${e??"Unknown"}
          </h4>
          <span class="time">
            ${n??"0s"}
          </span>
        </div>
        <p class="last-message">
          ${i??"Start new conversation"}
        </p>
      </div>
    `),r}getUserChats(){this.httpRequestManager.GET({resourcePath:"/api/v1/chats",onComplete:e=>{e.forEach(t=>{const s=v(t);s&&this.stateStore.addChat(s)})},onError:e=>{console.error("Fetching current user data failed :",e)}})}}class S{constructor(){this.dropdownConfig()}dropdownConfig(){document.querySelectorAll(".dropdown").forEach(t=>{const s=t.querySelector(".dropbtn"),n=t.querySelector(".dropdown-content");if(!s||!n)return;const i=Array.from(n.querySelectorAll(".drop-item")),r=c=>{t&&!t.contains(c.target)&&n.classList.remove("drop-open")};s.addEventListener("click",c=>{n.classList.contains("drop-open")?(n.classList.remove("drop-open"),window.removeEventListener("click",r)):(n.classList.add("drop-open"),window.addEventListener("click",r)),c.stopPropagation()}),i.forEach(c=>{c.addEventListener("click",()=>{n.classList.remove("drop-open")})})})}}class T{constructor(e,t){a(this,"stateStore");a(this,"httpRequestManager");a(this,"modalElements");a(this,"modalConfiguration");a(this,"chatConfiguration");a(this,"paginationState");a(this,"usersList",null);a(this,"fetchUsers",async()=>{await this.httpRequestManager.GET({resourcePath:"/api/v1/users",params:{username:this.modalConfiguration.searchQuery,page:`${this.paginationState.currentPage??0}`,size:"8"},onStart:()=>{console.log("Fetching")},onComplete:e=>{const t=(e==null?void 0:e.content)??[];this.paginationState.totalPages=(e==null?void 0:e.totalPages)??1,this.renderUserList(t)},onError:e=>{console.error("Error while fetching",e)}})});a(this,"renderStepTwo",()=>{const e=this.modalElements.contentContainer;for(;e.firstChild;)e.removeChild(e.firstChild);const t=document.createElement("section");t.className="search-container";const s=document.createElement("input");s.id="user-search",s.type="text",s.placeholder="Search user",s.className="search-input",t.appendChild(s),e.appendChild(t);const n=document.createElement("section");n.id="users-list",n.className="users-list",n.addEventListener("keydown",i=>{["ArrowUp","ArrowDown"].includes(i.key)&&(i.preventDefault(),i.stopPropagation())}),e.appendChild(n),s.addEventListener("input",i=>{this.chatConfiguration.searchQuery=i.target.value??"",this.paginationState.currentPage=0,this.paginationState.totalPages=1,this.debounce(()=>{this.modalConfiguration.fetchedUsers&&this.usersList&&(this.usersList.innerHTML=""),this.fetchUsers()},500)()}),this.usersList=n,this.fetchUsers()});a(this,"renderStepThree",()=>{this.modalElements.contentContainer.innerHTML=`
     <div class="name-description-form-item">
              <label
                for="group-name"
                class="name-description-form-label"
                aria-required="true"
                >Name</label
              >
              <input
                id="group-name"
                class="name-description-form-input"
                type="text"
                minlength="6"
                required
              />
            </div>
            <div class="name-description-form-item">
              <label for="group-description" class="name-description-form-label"
                >Description</label
              >
              <textarea
                id="group-description"
                name="group-description"
                class="name-description-form-input"
                rows="6ss"
              ></textarea>
            </div>
    `;const e=this.modalElements.contentContainer.querySelector("#group-name"),t=this.modalElements.contentContainer.querySelector("#group-description");e.addEventListener("input",s=>{const n=s.target.value??"";this.chatConfiguration.groupDetails.name=n,n.length>=6?this.modalElements.submitButton.disabled=!1:this.modalElements.submitButton.disabled=!0}),t.addEventListener("input",s=>{const n=s.target.value??"";this.chatConfiguration.groupDetails.description=n})});a(this,"renderUserList",(e=[])=>{if(!this.usersList)return;const t=e.map(({name:s,avatarUrl:n},i)=>{const r=this.createUserListItem(s,n,i);return this.usersList.appendChild(r),r});this.usersList.addEventListener("keydown",s=>{const n=t;let i=Array.from(n).findIndex(r=>r===document.activeElement);if(s.key==="ArrowDown"||s.key==="ArrowUp"){if(i===-1)return;let r=s.key==="ArrowDown"?i+1:i-1;r>=0&&r<n.length&&n[r].focus()}}),t.length>0&&(this.modalConfiguration.intersectionObserver.disconnect(),this.modalConfiguration.intersectionObserver.observe(t[t.length-1]))});a(this,"createUserListItem",(e,t,s)=>{const n=document.createElement("button");n.type="button",s!==0&&(n.tabIndex=-1);const i=Object.keys(this.chatConfiguration.selectedUsers??{}).includes(e);n.className=i?"user-item active-member":"user-item",n.setAttribute("name",e);const r=document.createElement("img");r.className="user-item-avatar",r.src=t,r.alt="User Avatar";const c=document.createElement("p");return c.className="user-item-name",c.textContent=e,n.appendChild(r),n.appendChild(c),n.addEventListener("click",g=>{const h=g.target.closest(".user-item");if(!h)return;const p=h.getAttribute("name");p&&(this.chatConfiguration.chatType==="direct"?this.handleDirectChatSelection(p,h):this.chatConfiguration.chatType==="group"&&this.handleGroupChatSelection(p,h),Object.keys(this.chatConfiguration.selectedUsers).length?this.modalElements.submitButton.disabled=!1:this.modalElements.submitButton.disabled=!0)}),n});a(this,"handleDirectChatSelection",(e,t)=>{if(this.chatConfiguration.selectedUsers[e])t.classList.remove("active-member"),this.chatConfiguration.selectedUsers={};else{if(!this.usersList)return;this.usersList.querySelectorAll(".active-member").forEach(s=>s.classList.remove("active-member")),t.classList.add("active-member"),this.chatConfiguration.selectedUsers={[e]:{node:t,name:e}}}});a(this,"handleGroupChatSelection",(e,t)=>{if(this.chatConfiguration.selectedUsers[e]){t.classList.remove("active-member");const{[e]:s,...n}=this.chatConfiguration.selectedUsers;this.chatConfiguration.selectedUsers=n}else t.classList.add("active-member"),this.chatConfiguration.selectedUsers[e]={node:t,name:e}});a(this,"createChat",()=>{var s;const e=(s=this.stateStore.getCurrentUser())==null?void 0:s.name;if(!e)return;const t={name:this.chatConfiguration.chatType==="direct"?void 0:this.chatConfiguration.groupDetails.name,description:this.chatConfiguration.chatType==="direct"?void 0:this.chatConfiguration.groupDetails.name,type:this.chatConfiguration.chatType,owner:e,members:Object.keys(this.chatConfiguration.selectedUsers)};this.httpRequestManager.POST({resourcePath:"/api/v1/chats",body:t,onStart:()=>{this.modalElements.submitButton.disabled=!0},onComplete:n=>{const i=v(n);i&&this.stateStore.addChat(i),this.modalElements.modalContainer.classList.remove("open-modal")}})});this.stateStore=e,this.httpRequestManager=t,this.modalElements={modalContainer:document.getElementById("new-chat-modal"),contentContainer:document.getElementById("modal-form-content"),submitButton:document.getElementById("submit-modal-btn"),openButton:document.getElementById("open-new-chat-modal"),closeButton:document.getElementById("close-new-chat-modal"),cancelButton:document.getElementById("cancel-modal-btn")},this.resetForm(),this.initializeEventListeners()}resetForm(){this.modalConfiguration={currentStep:1,searchDebounceTimer:null,fetchedUsers:[],intersectionObserver:new IntersectionObserver(e=>{e.forEach(t=>{const s=this.paginationState.currentPage<this.paginationState.totalPages-1;t.isIntersecting&&s&&(this.paginationState.currentPage++,this.fetchUsers())})}),searchQuery:""},this.chatConfiguration={chatType:"direct",selectedUsers:{},searchQuery:"",groupDetails:{name:"",description:""}},this.paginationState={currentPage:0,totalPages:1},this.renderStepOne()}initializeEventListeners(){this.modalElements.closeButton.addEventListener("keydown",e=>{e.preventDefault(),e.key==="Tab"&&e.shiftKey&&this.modalElements.submitButton.focus()}),this.modalElements.submitButton.addEventListener("keydown",e=>{e.preventDefault(),e.key==="Tab"&&!e.shiftKey&&this.modalElements.closeButton.focus()}),this.modalElements.submitButton.addEventListener("click",e=>{switch(e.preventDefault(),this.modalConfiguration.currentStep){case 1:this.modalConfiguration.currentStep=2,this.renderStepTwo(),this.chatConfiguration.chatType==="direct"&&(this.modalElements.submitButton.innerText="Submit"),this.modalElements.submitButton.disabled=!0;break;case 2:if(this.chatConfiguration.chatType==="direct"){this.createChat();break}if(this.chatConfiguration.chatType==="group"){this.modalConfiguration.currentStep=3,this.renderStepThree(),this.modalElements.submitButton.innerText="Submit",this.modalElements.submitButton.disabled=!0;break}break;case 3:this.createChat();break}}),this.modalElements.openButton.addEventListener("click",()=>{this.modalElements.modalContainer.classList.add("open-modal"),this.resetForm()}),this.modalElements.closeButton.addEventListener("click",()=>{this.modalElements.modalContainer.classList.remove("open-modal")}),this.modalElements.cancelButton.addEventListener("click",()=>{this.modalElements.modalContainer.classList.remove("open-modal")})}debounce(e,t){return(...s)=>{this.modalConfiguration.searchDebounceTimer!==null&&clearTimeout(this.modalConfiguration.searchDebounceTimer),this.modalConfiguration.searchDebounceTimer=window.setTimeout(()=>e(...s),t)}}renderStepOne(){this.modalElements.submitButton.innerText="Next",this.modalElements.submitButton.disabled=!1;const e=`
        <label class="form-radio-card" tabindex="0">
            <aside class="form-radio-card-icon frci-1">
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
                    ></path>
                </svg>
            </aside>
            <div class="form-radio-card-main">
                <h3>Direct Chat</h3>
                <p>
                    A private chat between you and the user you choose to connect with.
                </p>
            </div>
            <input type="radio" name="chatType" value="direct" />
        </label>
    `,t=`
        <label class="form-radio-card">
            <aside class="form-radio-card-icon frci-2">
                <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z"
                    ></path>
                </svg>
            </aside>
            <div class="form-radio-card-main">
                <h3>Group Chat</h3>
                <p>
                    A shared chat where you can talk with multiple users in a group.
                </p>
            </div>
            <input type="radio" name="chatType" value="group" />
        </label>
    `,s=this.modalElements.contentContainer;if(s){s.innerHTML=e+t;const n=s.querySelectorAll('input[name="chatType"]');n.length>0&&(n[0].checked=!0,n[0].focus()),n.forEach(i=>{i.addEventListener("change",r=>{const c=r.target;this.chatConfiguration.chatType=c.value})})}}}class I{constructor(e,t){t.GET({resourcePath:"/api/v1/users/me",onComplete:s=>{e.setCurrentUser(s),this.updateUserProfile(s.name,s.avatarUrl)},onError:s=>{console.error("Fetching current user data failed:",s)}})}updateUserProfile(e,t){const s=document.getElementById("profile-img-container"),n=document.getElementById("profile-name"),i=document.createElement("img");i.className="profile-img",n.innerHTML=e??"Unknown",i.src=t??"https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",s.appendChild(i),n.classList.remove("pulsate"),s.classList.remove("pulsate")}}const u=d.getInstance(),m=y.getInstance();new I(u,m);const U=new L(u,m);new T(u,m);new S;u.subscribe(U);const f=document.getElementById("logout-btn");f==null||f.addEventListener("click",()=>{m.POST({resourcePath:"/api/v1/auth/logout",body:{},onComplete:o=>{console.log({data:o}),window.location.href="/login"},onError:o=>{console.log({error:o})}})});
