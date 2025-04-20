import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  convertFromRaw,
  EditorState,
  SelectionState,
} from "draft-js";
import DOMPurify from "dompurify";
import katex from "katex";
import { stateToHTML } from "draft-js-export-html";

import hljs from "highlight.js";


// export const insertImage = (editorState: EditorState, url: string) => {
//   const contentState = editorState.getCurrentContent();
//   const contentStateWithEntity = contentState.createEntity(
//     "IMAGE",
//     "IMMUTABLE",
//     { src: url }
//   );
//   const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
//   const newEditorState = EditorState.set(editorState, {
//     currentContent: contentStateWithEntity,
//   });
//   return {
//     newEditorState: AtomicBlockUtils.insertAtomicBlock(
//       newEditorState,
//       entityKey,
//       " "
//     ),
//     entityKey,
//   };
// };

export const insertImage = (editorState: EditorState, url: string) => {
  // Get current content of the editor
  const contentState = editorState.getCurrentContent();

  // Create an IMAGE entity with the provided URL
  const contentStateWithEntity = contentState.createEntity(
    'IMAGE',
    'IMMUTABLE', // The image is immutable (cannot be edited once inserted)
    { src: url }  // Additional data (URL of the image)
  );

  // Get the entity key for the newly created entity
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

  // Create a new editor state with the updated content (with the IMAGE entity)
  const newEditorState = EditorState.push(
    editorState,
    contentStateWithEntity,
    'insert-characters' // This tells Draft.js it's a modification involving character insertions
  );

  // Insert the atomic block (image block) at the cursor position
  const editorStateWithAtomicBlock = AtomicBlockUtils.insertAtomicBlock(
    newEditorState,
    entityKey,
    ' ' // Empty space placeholder to represent the atomic block
  );

  return {
    newEditorState: editorStateWithAtomicBlock,
    entityKey,
  };
};

export const insertMedia = (
  editorState: EditorState,
  mediaType: string,
  src: string | object
) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    mediaType,
    "IMMUTABLE",
    typeof src === "string" ? { src } : src
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(editorState, {
    currentContent: contentStateWithEntity,
  });
  return {
    newEditorState: AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      " "
    ),
    entityKey,
  };
};

export const removeAtomicBlock = (
  editorState: EditorState,
  blockKey: string
) => {
  const contentState = editorState.getCurrentContent();
  const blockMap = contentState.getBlockMap().delete(blockKey);
  //   const newContentState = contentState.merge({
  //     blockMap,
  //   });
  const newContentState = ContentState.createFromBlockArray(blockMap.toArray());
  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    "remove-range"
  );
  return newEditorState;
};

// absolute right-0 top-2 group inline-block
// absolute right-0 bg-blue-500 rounded p-1
// relative left-[98%] top-7 bg-white rounded p-1 hidden group-hover:inline-block


const buttons =(src:string, name="image") => {

 return (`
<div class="i-container">
	<span class="i-dropdown">
      <button class="i-menu-button">⋮</button>
      
     
<a href="${src}" target="_blank" download="${name}" class="i-dropdown-content">
<svg class="w-5 h-5 btn-effect" viewBox="0 0 24 24" fill="orange" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V12.1893L14.4697 10.4697C14.7626 10.1768 15.2374 10.1768 15.5303 10.4697C15.8232 10.7626 15.8232 11.2374 15.5303 11.5303L12.5303 14.5303C12.3897 14.671 12.1989 14.75 12 14.75C11.8011 14.75 11.6103 14.671 11.4697 14.5303L8.46967 11.5303C8.17678 11.2374 8.17678 10.7626 8.46967 10.4697C8.76256 10.1768 9.23744 10.1768 9.53033 10.4697L11.25 12.1893V7C11.25 6.58579 11.5858 6.25 12 6.25ZM8 16.25C7.58579 16.25 7.25 16.5858 7.25 17C7.25 17.4142 7.58579 17.75 8 17.75H16C16.4142 17.75 16.75 17.4142 16.75 17C16.75 16.5858 16.4142 16.25 16 16.25H8Z" fill="#1C274C"></path> </g></svg>
</a>

</span> 
</div>
`)

}






export const handleDraftToHtml = (postJson: string) => {
  let options = {
    inlineStyles: {
      LATEX: { attributes: { class: "latex" } },
      HASHTAG: { attributes: { class: "hashtag" } },
    },

    blockRenderers: {
      atomic: (block: ContentBlock) => {
        // const contentState = editorState.getCurrentContent();
        const entityKey = block.getEntityAt(0);

        if (entityKey) {
          const entity = contentState.getEntity(entityKey);
          const { src, name, className } = entity.getData();

          if (entity.getType() === "IFRAME") {
            // Render the iframe HTML tag

            return `<div class="iframe-container relative" style="padding-bottom: 56.25%; height: 0;">
                      <iframe
                        src="${src}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="width: 100%; max-width: 334px; aspect-ratio: 16/9"
                      ></iframe>
		      ${buttons(src, name)}
                    </div>`;
          }

          if (entity.getType() === "IMAGE") {
            return `
		<div class="relative">
		  <img src="${src}"  alt="embeded image" class="${className}" />
		  ${!/sticker/.test(className) ? buttons(src, name) : ""}
		</div>`
	 ;
          }
          if (entity.getType() === "AUDIO") {
            return `<audio controls class="relative">
              <source src="${src}" />
	      ${buttons(src, name)}
            </audio>`;
          }
          if (entity.getType() === "VIDEO") {
            return `<video controls>
              <source src="${src}" />
 
            </video>`;
          }
          if (entity.getType() === "LINK") {
            const { url, target, rel, className } = entity.getData();
            return `<a
              target="${target}"
              rel="${rel}"
              href="${url}"
              class="${className}"
            >
              ${block.getText()}
            </a>`;
          }
          if (entity.getType() === "FILE") {
            return `<div class="file-container">
              <span class="file-name">${name}</span>
              <div class="dropdown">
                <button class="menu-button">⋮</button>
                <div class="dropdown-content">
                  <a href="${src}" target="_blank" download="${name}" class="download-option">⬇️ Download</a>
                </div>
              </div>
            </div>`;
          }
        }

        return ""; // Return empty for other atomic blocks
      },
    },
  };
  const domParser = new DOMParser();
  if (!postJson) return;
  const contentState = convertFromRaw(JSON.parse(postJson));

  let html = stateToHTML(contentState, options);
  html = html
    .replace(/<figure>/g, "")
    .replace(/<\/figure>/g, "")
    .replace(/<.*>(.*#.*)?<\/.*>/g, (match) => {
      match = match.trim().replace(/#\S+/g, "<span class='hashtag'>$&</span>");
      return match;
    });

  let htmlDocs = html.replace(
    /(<pre><code>.*?<\/code><\/pre>\s*){1,}/gs,
    (match) => {
      // match = match.trim();
      // match = match
      //   // .replace(/<pre><code>/g, "<code>")
      //   // .replace(/<\/code><\/pre>/g, "</code>");

      // return `<div class="code">${match}</div>`;
      let codeContent = "";
      const doc = domParser.parseFromString(match, "text/html");
      doc.querySelectorAll("pre code")?.forEach(ele => {
        codeContent += `<pre><code>${hljs.highlightAuto(ele?.textContent || "").value}</code></pre>` ;
      })

      return `<div class="code">${codeContent}</div>`;
    }
  );

  htmlDocs = htmlDocs.replace(
    /<span class="latex">(.*?)<\/span>/g,
    (match, p1) => {
      const doc = domParser.parseFromString(match, "text/html");
      let latex = doc.querySelector("span.latex")?.textContent?.trim();
      latex = latex;
      return `<span class="math">${katex.renderToString(latex || "", {
        throwOnError: false,
        displayMode: true,
        strict: "ignore",
      })}</span>`;
    }
  );
  

  // console.log("htmlDocs", htmlDocs);

  const purifyConfig = {
    ADD_ATTR: [
      "target",
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "src",
      "width",
      "height",
    ],
    ADD_TAGS: ["iframe"],
    FORBID_TAGS: ["script"],
    ALLOW_ARIA_ATTR: true,
    FORBID_ATTR: ["onload", "onclick"], // Disallow inline event handlers
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:https?|mailto|ftp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))|data:image\/)/i, // Ensure safe URIs
  };
  // htmlDocs = DOMPurify.sanitize(htmlDocs, purifyConfig);
  return htmlDocs;
};
