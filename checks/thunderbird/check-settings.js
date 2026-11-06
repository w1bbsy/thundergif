
// Added only to the check build's settings page: reports what the user would see through the
// page title, which the check reads from Thunderbird's side (it cannot reach into the page).
setInterval(() => {
  const steps = document.getElementById('show-gifs');
  const copy = document.querySelector('button[aria-label="Copy the GIPHY address"]');
  const box = copy?.getBoundingClientRect();
  document.title = 'CHECK' + JSON.stringify({
    shown: !steps.hidden,
    inView: steps.getBoundingClientRect().top >= 0 && steps.getBoundingClientRect().top < innerHeight,
    scrolled: scrollY > 0,
    copyAt: box ? [Math.round(box.left + box.width / 2), Math.round(box.top + box.height / 2)] : null,
    status: document.querySelector('.copy-status').textContent,
  });
}, 200);
