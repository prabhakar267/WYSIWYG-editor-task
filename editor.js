/*******************************
* what-you-see-is-what-you-get *
*******************************/

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

function divideParagraph(el) {
  let caretPosition = window.getSelection().anchorOffset;
  let referenceString = $(el).text();
  let leftPart = referenceString.slice(0, caretPosition);
  let rightPart = referenceString.slice(caretPosition);

  if (leftPart != 0) {
    $(el).text(leftPart);
    $(el).after('<p contenteditable="true" placeholder="Here. Take this space to write ...">' + rightPart + '</p>');
    $(el).next().focus();
  }
}

dragula([document.querySelector('#editor')]);

$('body').on('keydown', '#editor>p', e => {
  let domNode = e.target;
  if (e.keyCode == 13) {
    divideParagraph(domNode);
    return false;
  }
});

$('body').on('keydown', '#editor>p:last-child', e => {
  let domNode = e.target;
  if (e.keyCode == 13) {
    let caretPosition = window.getSelection().anchorOffset;
    let paralength = $(domNode).html().length;
    if (paralength != 0 && caretPosition == paralength) {
      $('#editor').append('<p contenteditable="true" placeholder="Here. Take this space to write ..."></p>');
      $('#editor>p:last-child').focus();
    }
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
  let selectedItemRange = window.getSelection().getRangeAt(0);
  let stringInRange = selectedItemRange.toString();
  let locationBounds = selectedItemRange.getBoundingClientRect();
  $('body').append(
    '<div id="style-tooltip" style="left: ' + locationBounds.left + 'px; top: ' + (locationBounds.top - 40) + 'px">\
      <span data-active="true" data-value="bold">B</span><span data-active="false" data-value="italics">I</span><span data-active="false" data-value="red">R</span>\
    </div>'
  );
  // let childComponents = '<em>' + stringInRange + '</em>';
  // let newHTMLContent = document.createElement('strong');
  // newHTMLContent.innerHTML = childComponents;
  // selectedItemRange.deleteContents();
  // selectedItemRange.insertNode(newHTMLContent);
});
