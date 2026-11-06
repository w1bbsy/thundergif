
// Added only to the check build's settings page: reports what the user would see through the
// page title, which the check reads from Thunderbird's side (it cannot reach into the page).
// Previews come from the Providers' other media servers, which the add-on holds no permission for.
// They must still load as ordinary images on the add-on's own pages.
const previews = [
  'https://media1.giphy.com/media/v1.Y2lkPWYwODJhZjNmbXlyMXo5NDZ6aDlpdTF0d3FxYWFvMnNrcDRzMDhmbjV0aXJlZHc5aiZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/axu6dFuca4HKM/giphy.gif',
  'https://static2.klipy.com/ii/84b4c0b02782dda9051003f9e36484ec/5d/93/bmwu4BDQ.gif',
].map((src) => Object.assign(new Image(), { src }));

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
    previewsLoaded: previews.every((img) => img.complete && img.naturalWidth > 0),
  });
}, 200);
