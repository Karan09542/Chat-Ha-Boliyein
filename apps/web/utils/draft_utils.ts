import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  convertFromRaw,
  EditorState,
} from "draft-js";
import DOMPurify from "dompurify";
import katex from "katex";
import { stateToHTML } from "draft-js-export-html";
export const insertImage = (editorState: EditorState, url: string) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    "IMAGE",
    "IMMUTABLE",
    { src: url }
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
          const { src, name } = entity.getData();
          console.log("entityData", entity.getData());

          if (entity.getType() === "IFRAME") {
            // Render the iframe HTML tag

            return `<div class="iframe-container" style="padding-bottom: 56.25%; height: 0;">
                      <iframe
                        src="${src}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="width: 100%; max-width: 334px; aspect-ratio: 16/9"
                      ></iframe>
                    </div>`;
          }

          if (entity.getType() === "IMAGE") {
            return `<img src="${src}" alt="embeded image" />`;
          }
          if (entity.getType() === "AUDIO") {
            return `<audio controls>
              <source src="${src}" />
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
                  <a href="${src}" download="${name}" class="download-option">⬇️ Download</a>
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
    /(<pre><code>.*?<\/code><\/pre>\s*){1,}/g,
    (match) => {
      match = match.trim();
      match = match
        .replace(/<pre><code>/g, "<code>")
        .replace(/<\/code><\/pre>/g, "</code>");

      return `<div class="code">${match}</div>`;
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
