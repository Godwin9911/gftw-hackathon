(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function showMonetizationState() {
  const state = document.monetization.state;
  if (state === 'started') {
    document.getElementById('start-button').classList.remove('hidden');
  }
  document.getElementById('state').innerText = document.monetization.state;
}

function checkAndStartMonetization() {
  if (document.monetization) {
    document.monetization.addEventListener(
      "monetizationstop",
      showMonetizationState
    );
    document.monetization.addEventListener(
      "monetizationstart",
      showMonetizationState
    );
    document.monetization.addEventListener(
      "monetizationpending",
      showMonetizationState
    );
    document.monetization.addEventListener(
      'monetizationprogress', 
      (e) => {
        // showMonetizationState
        // console.log('monetizationprogress', e.detail)
      }
    );
  }
}

const pointers = {
  '$coil.xrptipbot.com/JABJLDXNSje7h_bY26_6wg': 50,
  'creators': 50
}

function pickPointer () {
  const sum = Object.values(pointers).reduce((sum, weight) => sum + weight, 0)
  let choice = Math.random() * sum

  for (const pointer in pointers) {
    const weight = pointers[pointer]
    if ((choice -= weight) <= 0) {
      return pointer
    }
  }
}

window.addEventListener('load', (e) => {
  // show error for non-supported browsers
  if (!document.monetization) {
    const state = document.getElementById('state')
    state.innerText = '$ Not enabled in browser';
    state.style.color = 'red';
  } else {
    showMonetizationState();
  }

  const stopButton = document.getElementById("stop-button");
  const startButton = document.getElementById("start-button");
  const mode = document.getElementById('mode');
  const currentReciever = document.getElementById('currentReciever');
  let monetizationTag;
  let currentWallet;

  function addMonitizationMetaTag() {
    monetizationTag = document.createElement('meta');
    monetizationTag.name = 'monetization';
    monetizationTag.content = '$coil.xrptipbot.com/JABJLDXNSje7h_bY26_6wg'
    document.head.appendChild(monetizationTag);
  }

  (function ViewAsMonetized(){
    addMonitizationMetaTag();
    checkAndStartMonetization();
    mode.innerText = '💸 Monitized';
  })();
  
  // const whoEarns = pickPointer();
  // const whoEarns = '$coil.xrptipbot.com/JABJLDXNSje7h_bY26_6wg';
  const whoEarns = 'creators';

  // if post is standard we'll pay the platform owner, if post is premium, pay post creator.
  function payPostInView(entry){
    let wallet = entry.target.getAttribute('data-wallet');
    // if current post owner is already being paid, continue paying
    if (currentWallet !== wallet ) {
      currentWallet = wallet;
      // set meta content to wallet Id
      monetizationTag.setAttribute('content', wallet);
      currentReciever.innerText = '💸 Paying ' + wallet;
    }
  }

  // Get dummy data
  fetch('post.json')
    .then(res => res.json())
    .then(data => {
      const posts = data.map(post => {
        return `<div data-wallet="${post.wallet}" class="${(post.content_type === 'premium') ? 'hidden' : 'show'} ${post.content_type} post">
                  ${(post.content_type === 'premium') ? `<div class="post-desc"><p>	&#11088; Premium</p></div>` : ``}
                  <div>
                    <img src="${post.image}"/>
                    <div>
                      <button class="btn c-btn my-btn">Comment</button>
                      <p><b>Caption:</b>${post.post_caption}</p>
                      <small>${post.comment_one}</small><br>
                      <small>${post.comment_two}</small>
                    </div>
                    <div class="space"></div>
                  </div>
                </div>`
        }).join('');

        document.getElementById('content').innerHTML = posts;
        setUpCommentModal();
    });
  
  function observerIntersection() {
    postElements = document.querySelectorAll(".post");

    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.75
    }

    let observer = new IntersectionObserver(handleIntersect, options);
    postElements.forEach(post => observer.observe(post));
  }

  function handleIntersect(entries) {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0.75) {
        payPostInView(entry);
      }
    })
  }

  stopButton.addEventListener("click", () => {
    // remove monetization meta tag
    document.querySelector('meta[name="monetization"]').remove();

    //hide premium content
    const premiumEl = document.querySelectorAll('.premium');
    premiumEl.forEach((el) => el.classList.add('hidden'));

    mode.innerText = 'Not Monitized';
    currentReciever.innerText = '';

    stopButton.disabled = true;
    startButton.disabled = false;
  });

  startButton.addEventListener("click", () => {
    // if monetization tag is not in dom add it.
    if (!document.querySelector('meta[name="monetization"]')) addMonitizationMetaTag();
    
    // check who should earn
    if (whoEarns !== 'creators') return currentReciever.innerText = 'Paying platform owner';

    // Get and Pay post in viewport
    observerIntersection();

    //Show premium content
    const premiumEl = document.querySelectorAll('.premium');
    premiumEl.forEach((el) => el.classList.remove('hidden'));

    mode.innerText = '💸 Monitized';
 
    stopButton.disabled = false;
    startButton.disabled = true;
  });

  function setUpCommentModal() {
    // Get the modal
    let modal = document.getElementById("myModal");
    // Get the button that opens the modal
    let btn = document.querySelectorAll(".my-btn");
    
    btn.forEach(b => b.addEventListener('click', () => {
      modal.style.display = "block";
    }));

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];
    
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }
});

},{}]},{},[1]);
