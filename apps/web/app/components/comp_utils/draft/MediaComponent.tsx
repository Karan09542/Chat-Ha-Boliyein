"use client";

import React from "react";
import { RxCross2 } from "react-icons/rx";

type MediaProps = {
  blockProps: {
    mediaData?: {
      src: string;
      name?: string;
      className?: string;
      fileType?: string
    };
    onRemove: (blockKey: string) => void;
  };
  block: any;
  contentState: any;
};

const MediaComponent = ({ blockProps, block, contentState }: MediaProps) => {
  const { mediaData, onRemove } = blockProps || {};
  const blockKey = block.getKey();
  const entityKey = block.getEntityAt(0)



  if (!mediaData || !mediaData.src) return null;

  const { src, name, className, fileType } = mediaData;
  const mediaType = entityKey ? contentState.getEntity(entityKey).type || "" : ""

  const GetMediaTag = () => {


    switch (mediaType) {
      case "VIDEO":
        return (
          <video
            src={src}
            controls
            className="absolute top-0 left-0 w-full h-full"
          />
        );
      case "IMAGE":
        return <img src={src} alt="image" className={className || ""} />;
      case "IFRAME":
        return (
          <iframe
            src={src}
            title="Embedded Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        );
      case "AUDIO":
        return (
          <audio controls>
            <source src={src} />
          </audio>
        );
      case "FILE":
        return (
          <div className="flex rounded dark:border-white/20 border-black/20 border px-3 py-1 dark:bg-white/20 bg-black/10 w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-6 h-7 mr-2" viewBox="0 0 30 20" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM13 3.5L18.5 9H14a1 1 0 01-1-1V3.5z" />
            </svg>

            <div>
              <p>{name || "Download File"}</p>
              <p>{fileType}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative transition-all ${mediaType || ""
        }-container min-[600px]:w-[334px]`}
      style={
        ["IFRAME", "VIDEO"].includes(mediaType)
          ? { aspectRatio: "16/9" }
          : { width: "fit-content" }
      }
    >
      <GetMediaTag />
      <RxCross2
        onMouseDown={(e) => {
          e.stopPropagation();
          onRemove?.(blockKey);
        }}
        size={24}
        className="absolute -top-7 right-0 text-white bg-black rounded-full cursor-pointer"
      />
    </div>
  );
};

// ✅ Only re-render if mediaData actually changes (shallow check)
export default React.memo(MediaComponent, (prevProps, nextProps) => {
  const prev = prevProps.blockProps?.mediaData;
  const next = nextProps.blockProps?.mediaData;
  return (
    prev?.src === next?.src &&
    prev?.name === next?.name &&
    prev?.className === next?.className
  );
});



