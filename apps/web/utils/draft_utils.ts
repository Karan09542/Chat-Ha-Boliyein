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

type Src = {
  src?: string
  name?: string
  fileType?:string
  className?:string
}
export const insertMedia = (
  editorState: EditorState,
  mediaType: string,
  src: string | Src
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
          const { src, name, className, fileType } = entity.getData();

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


${className === "image" ? `<input type="radio" id="${entityKey}-om" name="image-show" class="hidden">` : ""}

${ className === "image" ? `<input type="radio" id="${entityKey}" name="image-show" class="hidden">` : "" }


<label for="${entityKey}" class="cursor-pointer">

  <div class="${className || "image"} inline-block">
  ${className === "image" ? `
    <div class="image-size-container">
    <label for="normal" class="hidden">
    normal
</label>
<label for="sm" class="hidden">
sm
</label>
<label for="md" class="hidden">
md
</label>
<label for="lg" class="hidden">
lg
</label>
</div>
<input type="radio" name="image-size" id="normal" data-size="normal" 
class="hidden" checked />
<input type="radio" name="image-size" data-size="sm" id="sm" class="hidden" />
<input type="radio" name="image-size" data-size="md" id="md" class="hidden" />
<input type="radio" name="image-size" data-size="lg" id="lg" class="hidden" />
` : "" }

  <img src="${src}" alt="tashweer" class="" />

  ${className === "image" ? `
    <label for="${entityKey}-om" class="image-show-toggle absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" 
           viewBox="0 0 24 24" 
           fill="none" 
           stroke="red" 
           stroke-width="2" 
           stroke-linecap="round" 
           stroke-linejoin="round"
           class="w-6 h-6">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </label>
  ` : ""}
 ${!/sticker|gif/.test(className) ? buttons(src, name) : ""}
</div>


</label>


		</div>`
	 ;
          }
          if (entity.getType() === "AUDIO") {
            return `<audio controls class="relative max-[600px]:w-68">
              <source src="${src}" />
	      ${buttons(src, name)}
            </audio>`;
          }
          if (entity.getType() === "VIDEO") {
            return `<video style="width: 100%; max-width: 334px; aspect-ratio: 16/9" controls >
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
            return `<div class="relative border !border-black/50 bg-black/50 file-container">
              <span class="absolute top-0 text-xs text-rose-500 ">${fileType?.split(/[/]/)?.at(-1) || ""}</span>
              <span class="file-name my-2">${name}</span>
              <div class="dropdown">
                <button class="menu-button">⋮</button>
                <div class="rounded dropdown-content">
                  <a href="${src}" target="_blank" download="${name}" class="btn-effect download-option select-none rounded">⬇️ Download</a>
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
"href",
    ],
    ADD_TAGS: ["iframe"],
    FORBID_TAGS: ["script"],
    ALLOW_ARIA_ATTR: true,
    FORBID_ATTR: ["onload", "onclick"], // Disallow inline event handlers
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:https?|mailto|ftp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))|data:(text\/.*|application\/.*|image\/.*))/i, // Ensure safe URIs
  };

  htmlDocs = DOMPurify.sanitize(htmlDocs, purifyConfig);
  return htmlDocs;
};
