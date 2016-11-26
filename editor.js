/*******************************
* what-you-see-is-what-you-get *
*******************************/

let selectionDone = undefined;
let selectedItemRange = undefined;

function nextParagraph(el) {
  let referenceString = $(el).text();

  if (referenceString.length != 0) {
    $(el).after('<p contenteditable="true" placeholder="Here. Jot away ..."></p>');
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
  selectionDone = window.getSelection();
  selectedItemRange = selectionDone.getRangeAt(0);
  let stringInRange = selectedItemRange.toString();
  let locationBounds = selectedItemRange.getBoundingClientRect();
  $('body').append(
    '<div id="style-tooltip" style="left: ' + locationBounds.left + 'px; top: ' + (locationBounds.top - 40) + 'px">\
      <span data-active="false" data-value="strong">B</span><span data-active="false" data-value="em">I</span><span data-active="false" data-value="font">R</span>\
    </div>'
  );
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

$('body').on('click', '#style-tooltip>span', e => {
  let parent, firstChild, secondChild, newHTMLNode, newNodeChildren;
  let activeTags = [];
  let domNode = e.target;
  let textContent = selectedItemRange.toString();
  let styleToModify = $(domNode).attr('data-value');
  let currentStyleStatus = $(domNode).attr('data-active');

  if ($(domNode).attr('data-active') == 'true') {
    $(domNode).attr('data-active', 'false');
  } else {
    $(domNode).attr('data-active', 'true');
  }
  $('#style-tooltip>span').each((i, node) => {
    if ($(node).attr('data-active') == 'true') {
      activeTags.push($(node).attr('data-value'))
    }
  });
  activeTags.sort();
  [parent, firstChild, secondChild] = activeTags;
  if (parent != undefined) {
    newHTMLNode = document.createElement(parent);
    if (firstChild != undefined) {
      if (secondChild != undefined) {
        newNodeChildren = '<' + firstChild + '><' + secondChild + '>' + textContent + '<' + secondChild + '/><' + firstChild + '/>';
      } else {
        newNodeChildren = '<' + firstChild + '>' + textContent + '<' + firstChild + '/>';
      }
    } else {
      newNodeChildren = textContent;
    }
    newHTMLNode.innerHTML = newNodeChildren;
  } else {
    newHTMLNode = document.createTextNode(textContent);
  }

  let ghost = document.createTextNode('\u200B');
  selectedItemRange.deleteContents();
  selectedItemRange.insertNode(newHTMLNode);
  selectedItemRange.collapse(false);
  selectedItemRange.insertNode(ghost);
});
