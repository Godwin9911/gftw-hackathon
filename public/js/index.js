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
  const windowWidth = window.innerWidth/2;
  const windowHeight = window.innerHeight/2;
  let monetizationTag;

  function addMonitizationMetaTag() {
    monetizationTag = document.createElement('meta');
    monetizationTag.name = 'monetization';
    monetizationTag.content = '$coil.xrptipbot.com/JABJLDXNSje7h_bY26_6wg'
    document.head.appendChild(monetizationTag);
  }

  (function ViewAsMonetized(){
    addMonitizationMetaTag();
    checkAndStartMonetization();
  })();
  
  // const whoEarns = pickPointer();
  // const whoEarns = '$coil.xrptipbot.com/JABJLDXNSje7h_bY26_6wg';
  const whoEarns = 'creators';
  
  let isScrolling;
  let currentWallet;

  // if post is standard we'll pay the platform owner, if post is premium, pay post creator.
  function payPostInView(){
    let el = document.elementFromPoint(windowWidth, windowHeight);
    let wallet = el.getAttribute('data-wallet');
    // if current post owner is already being paid, continue paying
    if (currentWallet === wallet ) {
      return;
    }
    currentWallet = wallet;
    // set meta content to wallet Id
    monetizationTag.setAttribute('content', wallet);
    return currentReciever.innerText = '💸 Paying ' + wallet;
  }

  // payEvent
  function payEvent(){
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(payPostInView(), 400);
  }

  // pick who to pay, by default we are paying the platform owner
  function pickWhoToPay() {
    if (whoEarns === 'creators') {
      //set eventlistener to get their wallet from their post when their post is in view
      window.addEventListener('scroll', payEvent);
    }
  }

  // TODO - add small sized video to page

  // Get dummy data
  fetch('post.json')
    .then(res => res.json())
    .then(data => {
      const posts = data.map(post => {
        return `<div data-wallet="${post.wallet}" class="${(post.content_type === 'premium') ? 'hidden' : 'show'} ${post.content_type} post">
                  ${(post.content_type === 'premium') ? `<div class="post-desc"><p>	&#11088; Premium</p></div>` : ``}
                  <div data-wallet="${post.wallet}">
                    <img src="${post.image}" data-wallet="${post.wallet}"/>
                    <div data-wallet="${post.wallet}">
                      <button class="btn c-btn my-btn">Comment</button>
                      <p data-wallet="${post.wallet}">Caption:${post.post_caption}</p>
                      <small data-wallet="${post.wallet}">${post.comment_one}</small><br>
                      <small data-wallet="${post.wallet}">${post.comment_two}</small>
                    </div>
                    <div class="space" data-wallet="${post.wallet}"></div>
                  </div>
                </div>`
        }).join('');

        document.getElementById('content').innerHTML = posts;
        setUpCommentModal();
    });

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
    
    //pick who to pay - platform owner or creators
    pickWhoToPay();

    //Show premium content
    const premiumEl = document.querySelectorAll('.premium');
    premiumEl.forEach((el) => el.classList.remove('hidden'));

    //pay the creator of the content currently in view.
    if (whoEarns === 'creators') {
      payPostInView();
    } else {
      currentReciever.innerText = 'Paying platform owner';
    }

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
