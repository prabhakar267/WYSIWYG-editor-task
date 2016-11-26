/*******************************
* what-you-see-is-what-you-get *
*******************************/

let parentNode;

function nextParagraph(el) {
  let referenceString = $(el).text();

  if (referenceString.length != 0) {
    $(el).after('<p contenteditable="true" placeholder="Here, jot away ..."></p>');
    $(el).next().focus();
  }
}

dragula([document.querySelector('#editor')]);

$('body').on('keydown', '#editor>p', e => {
  let domNode = e.target;
  if (e.keyCode == 13) {
    nextParagraph(domNode);
    return false;
  }
});

$('body').on('focusout', '#editor>p', e => {
  let domNode = e.target;
  if ($(domNode).text().length == 0 && $('#editor>p').length > 1) {
    $(domNode).remove();
  }
});

$('body').on('dblclick', '#editor>p', e => {
  $('#style-tooltip').remove();
  let selectionDone = window.getSelection();
  let selectedItemRange = selectionDone.getRangeAt(0);
  let locationBounds = selectedItemRange.getBoundingClientRect();
  parentNode = selectedItemRange.commonAncestorContainer;

  $('body').append(
    '<div id="style-tooltip" style="left: ' + locationBounds.left + 'px; top: ' + (locationBounds.top - 40) + 'px">\
      <button id="b">B</button><button id="u">U</button><button id="r">R</button>\
    </div>'
  );
});

$('body').on('click', '#b', () => {
  document.execCommand('bold');
});

$('body').on('click', '#u', () => {
  document.execCommand('underline');
});

$('body').on('click', '#r', () => {
  console.log($(parentNode).parent().css('color'));
  if ($(parentNode).parent().css('color') == 'rgb(255, 0, 0)') {
    document.execCommand('removeFormat', false, 'forecolor');
  } else {
    document.execCommand('forecolor', false, 'red');
  }

});

$('body').mouseenter(() => {
  $('#style-tooltip').remove();
  selectionDone = undefined;
  selectedItemRange = undefined;
});

$('body').on('mouseleave', '#style-tooltip', () => {
  $('#style-tooltip').remove();
  selectionDone = undefined;
  selectedItemRange = undefined;
});
