// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: hand-peace;

// Display today's todo list from the obsidian

const VAULT_FOLDER_BOOKMARK = 'Notes';
const filePath = 'Life P&R/Daily/' + getTodayDate() + '.md';
const widget = new ListWidget();
const fm = FileManager.iCloud();
await renderWidget();

config.runsInWidget ? Script.setWidget(widget) : widget.presentSmall();

async function renderWidget() {
  if (!fm.bookmarkExists(VAULT_FOLDER_BOOKMARK)) { 
    const errorText = widget.addText(`No bookmark named ${VAULT_FOLDER_BOOKMARK} found`);
	  errorText.textColor = Color.red();
    return;
  }

  const content = await getFileContent();

  if (content) {
    for (const item of generateList(content)) {
      const stack = widget.addStack();
      const text = stack.addText(item.text);
      stack.setPadding(3, 0, 3, 0);
      text.textOpacity = item.opacity;
      text.font = Font.thinSystemFont(14);
    }
  } else {
    const text = widget.addText('<Empty>');
    text.textColor = Color.lightGray();
  }
}

async function getFileContent() {
  const vaultPath = fm.bookmarkedPath(VAULT_FOLDER_BOOKMARK);
  const fullFilePath = fm.joinPath(vaultPath, filePath);

  if (!fm.fileExists(fullFilePath)) { return ''; }
  const content = fm.readString(fullFilePath);
  return content;
}

function generateList(content) {
  const list = content.split('\n');
  const reg = /: false|: true|- \[x\]|- \[ \]/;
  const todoList = list.filter(item => reg.test(item));
  const formattedList = todoList.map(item => {
    return ({
      text: item.replace(': false', '').replace(': true', '').replace('- [x] ', '').replace('- [ ] ', ''),
      opacity: (item.includes(': true') || item.includes('- [x] ')) ? 0.5 : 1
    })
  });
  return formattedList;
}

function errorMessage(msg) {
	const errorText = widget.addText(msg);
	errorText.textColor = Color.red();
	return widget;
}

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}
