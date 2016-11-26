/*******************************
* what-you-see-is-what-you-get *
*******************************/

// global variables
let prevNode;
let parentNode;
let styleNesting;
let randomWordInst;

// method to create new contenteditable paragraph
function nextParagraph(el) {
  let referenceString = $(el).text();

  if (referenceString.length != 0) {
    $(el).after('<p contenteditable="true" placeholder="Here, jot away ..."></p>');
    $(el).next().focus();
  }
}

// make api request for random word payload
function randomWord() {
  let requestStr = "http://randomword.setgetgo.com/get.php";

  $.ajax({
    type: "GET",
    url: requestStr,
    data: { len: 4 },
    dataType: "jsonp",
    jsonpCallback: 'randomWordComplete'
  });
}

// function to avoid replacing 4 letter tag names
function avoidTags(p1, p2) {
  return ((p2 == undefined) || p2 == '')? p1:randomWordInst;
}

// replace 4 letter word occurances with the random word
function randomWordComplete(data) {
  randomWordInst = data.Word;

  $('#editor>p').each((i, node) => {
    let paraContent = $(node).html();
    $(node).html(paraContent.replace(/<[^>]+>|(\b\w{4}\b)/g, avoidTags));
  });

  $('#link-list>li').each((i, node) => {
    let paraContent = $(node).html();
    $(node).html(paraContent.replace(/\b\w{4}\b/g, avoidTags));
  });
}

// initialise dragula for paragraph drag and drop feature
dragula([document.querySelector('#editor')]);

// keydown event listener on contenteditable paragraphs
$('body').on('keydown', '#editor>p', e => {
  let domNode = e.target;
  if (e.keyCode == 13) {                            // on ENTER keydown
    nextParagraph(domNode);
    return false;
  }
});

// method to remove empty contenteditable paragraphs when they lose focus
$('body').on('focusout', '#editor>p', e => {
  let domNode = e.target;

  if ($(domNode).text().length == 0 && $('#editor>p').length > 1) {
    $(domNode).remove();
  }
});

// double click event listener for content inside contenteditable paragraphs
$('body').on('dblclick', '#editor>p', e => {
  $('#style-tooltip').remove();
  let selectionDone = window.getSelection();
  let selectedItemRange = selectionDone.getRangeAt(0);
  let locationBounds = selectedItemRange.getBoundingClientRect();
  colorNode = null;
  parentNode = $(selectedItemRange.commonAncestorContainer);

  // put tooltip into DOM
  $('body').append(
    '<div id="style-tooltip" style="left: ' + locationBounds.left + 'px; top: ' + (locationBounds.top - 48) + 'px">\
      <button id="b">B</button><button id="u">U</button><button id="r">R</button>\
    </div>'
  );

  styleNesting = [];

  // check for active styles and whether red color is active or not
  while (parentNode.prop('tagName') != 'P') {
    switch(parentNode.prop('tagName')) {
      case 'U':
        $('#u').addClass('active');
        styleNesting.push('underline');
        break;
      case 'B':
        styleNesting.push('bold');
        $('#b').addClass('active');
        break;
      case 'FONT':
        $('#r').addClass('active');
        colorNode = parentNode;                 // store font DOM node having color property for words
        break;
    }
    parentNode = parentNode.parent();
  }
});

// mouse enter event listener on body
$('body').mouseenter(() => {
  $('#style-tooltip').remove();
});

// mouse leave event listener on style-tooltip
$('body').on('mouseleave', '#style-tooltip', () => {
  $('#style-tooltip').remove();
});

// click event listener on bold button
$('body').on('click', '#b', () => {
  document.execCommand('bold');
  $('#b').toggleClass('active');
});

// click event listener on underline button
$('body').on('click', '#u', () => {
  document.execCommand('underline');
  $('#u').toggleClass('active');
});

// click event listener on red color button
$('body').on('click', '#r', () => {
  if (colorNode && colorNode.css('color') == 'rgb(255, 0, 0)') {
    document.execCommand('removeFormat', false, null);
    styleNesting.forEach(style => {
      document.execCommand(style);
    });
  } else {
    document.execCommand('foreColor', false, 'red');
  }
  $('#r').toggleClass('active');
});

// click event listener on 'Done' button
$('#scan-for-links').click(() => {
  let matches = [];

  $('#editor>p').each((i, node) => {
    let paraContent = $(node).text();
    let res = paraContent.match(/<a( href="[^"]+")?>[^<]+<\/a>/g);
    if (res != null) {
      matches.push(res);
    }
  });

  console.log(matches);
  $('#link-list').empty();

  matches.forEach(paraArray => {
    paraArray.forEach(matched => {
      $('#link-list').append('<li>' + matched + '</li>');
    });
  });
});

// click event listener on 'Replace 4 letter words' button to initiate 4 letter word replacement
$('#replace-four-letter-words').click(() => randomWord());
