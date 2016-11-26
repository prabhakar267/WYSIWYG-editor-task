/*******************************
* what-you-see-is-what-you-get *
*******************************/

let prevNode;
let parentNode;
let styleNesting;
let randomWordInst;

function nextParagraph(el) {
  let referenceString = $(el).text();

  if (referenceString.length != 0) {
    $(el).after('<p contenteditable="true" placeholder="Here, jot away ..."></p>');
    $(el).next().focus();
  }
}

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

function avoidTags(p1, p2) {
  return ((p2 == undefined) || p2 == '')? p1:randomWordInst;
}

function randomWordComplete(data) {
  randomWordInst = data.Word;

  $('#editor>p').each((i, node) => {
    let paraContent = $(node).html();
    $(node).html(paraContent.replace(/<[^>]+>|(\b\w{4}\b)/g, avoidTags));
    //console.log(paraContent.match(/(\b\w{4}\b)(?!>)/g))
  });

  $('#link-list>li').each((i, node) => {
    let paraContent = $(node).html();
    $(node).html(paraContent.replace(/\b\w{4}\b/g, avoidTags));
  });
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
  colorNode = null;
  parentNode = $(selectedItemRange.commonAncestorContainer);

  $('body').append(
    '<div id="style-tooltip" style="left: ' + locationBounds.left + 'px; top: ' + (locationBounds.top - 48) + 'px">\
      <button id="b">B</button><button id="u">U</button><button id="r">R</button>\
    </div>'
  );

  styleNesting = [];

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
        colorNode = parentNode;
        break;
    }
    parentNode = parentNode.parent();
  }
});

$('body').mouseenter(() => {
  $('#style-tooltip').remove();
});

$('body').on('mouseleave', '#style-tooltip', () => {
  $('#style-tooltip').remove();
});

$('body').on('click', '#b', () => {
  document.execCommand('bold');
  $('#b').toggleClass('active');
});

$('body').on('click', '#u', () => {
  document.execCommand('underline');
  $('#u').toggleClass('active');
});

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

$('#replace-four-letter-words').click(() => randomWord());
