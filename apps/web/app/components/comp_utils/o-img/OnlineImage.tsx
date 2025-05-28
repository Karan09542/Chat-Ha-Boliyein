import { useOnlineImageStore } from "@store/index";
import { is } from "immutable";
import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import outSideClose from "../../../../hooks/outSideClose";
import useDebounce from "../../../../hooks/useDebounce";
import { EditorState } from "draft-js";
import { OnlineMediaData, Src } from "../../../../utils/types";
import Link from "next/link";

interface OnlineImageProps {
  setIsOnlineImageOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => void;
  insertMedia: (
    editorState: EditorState,
    mediaType: string,
    src: string | Src
  ) => { newEditorState: EditorState; entityKey: string };
}
interface ImageGalleryProps
  extends Omit<OnlineImageProps, "setIsOnlineImageOpen"> {
  images: OnlineMediaData[];
  loading: boolean;
}
interface VideoGalleryProps
  extends Omit<OnlineImageProps, "setIsOnlineImageOpen"> {
  videos: OnlineMediaData[];
  loading: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  editorState,
  setEditorState,
  insertMedia,
  loading,
}) => {
  if (loading) return <div>Loading...</div>;
  if (images.length === 0)
    return (
      <div className="text-center py-10 text-gray-600 font-sans">
        <h1 className="text-3xl mb-4">😕 ImAGE Not Found</h1>
        <p className="text-lg">
          Sorry, we couldn't find what you were looking for.
        </p>
      </div>
    );

  return (
    <div className="image-gallery">
      {images?.map((image, index) => (
        <img
          key={image.id}
          src={image.displayUrl}
          className="feeling-press"
          onClick={() => {
            const { newEditorState, entityKey } = insertMedia(
              editorState,
              "IMAGE",
              { src: image.url, name: image.alt, className: "image" }
            );
            setEditorState(newEditorState);
          }}
        />
      ))}
    </div>
  );
};
const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  return (
    <div>
      {videos?.map((video, index) => (
        <video key={video.id} src={video.displayUrl} />
      ))}
    </div>
  );
};
const OnlineImage: React.FC<OnlineImageProps> = ({
  setIsOnlineImageOpen,
  editorState,
  setEditorState,
  insertMedia,
}) => {
  const searchQuery = useOnlineImageStore((state) => state.searchQuery);
  const activeTab = useOnlineImageStore((state) => state.activeTab);
  const setActiveTab = useOnlineImageStore((state) => state.setActiveTab);

  const debounceSearchQuery = useDebounce(searchQuery[activeTab], 500);
  const setSearchQuery = useOnlineImageStore((state) => state.setSearchQuery);
  const onlineImages = useOnlineImageStore((state) => state.onlineImages);
  const setOnlineImages = useOnlineImageStore((state) => state.setOnlineImages);
  const onlineVideos = useOnlineImageStore((state) => state.onlineVideos);
  const setOnlineVideos = useOnlineImageStore((state) => state.setOnlineVideos);
  const cache = useOnlineImageStore((state) => state.cache);
  const setCache = useOnlineImageStore((state) => state.setCache);

  const onlineImageRef = React.useRef<HTMLDivElement>(null);
  outSideClose({
    setState: setIsOnlineImageOpen,
    ref: onlineImageRef,
    arg: false,
  });
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);
  outSideClose({
    setState: setIsOpenDropdown,
    ref: dropdownRef,
    arg: false,
  });
  const mediaOptions = ["image", "video"];

  async function fetchMedia() {
    setLoading(true);
    let query = searchQuery[activeTab];
    if (!query) {
      if (activeTab === "image") {
        query = "shiva";
      }
      if (activeTab === "video") {
        query = "shiva";
      }
    }
    const cached = cache[`${query}_${activeTab}`];
    if (cached) {
      if (activeTab === "image") {
        setOnlineImages(cached);
      }
      if (activeTab === "video") {
        setOnlineVideos(cached);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/img?query=${query}&type=${activeTab}`);
      const data = await res.json();
      if (activeTab === "image") {
        setOnlineImages(data.data);
      }
      if (activeTab === "video") {
        setOnlineVideos(data.data);
      }
      setCache(`${query}_${activeTab}`, data.data);
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchMedia();
  }, [debounceSearchQuery, activeTab]);

  return (
    <div
      ref={onlineImageRef}
      className="fixed left-1/2 top-1/2 -translate-1/2 z-10 max-w-[600px] w-full "
    >
      <div className=" bg-black/20  max-[600px]:w-[95%] mx-auto w-120 mb-3 pb-1 rounded-xl border-1 border-black/20">
        {/* search and tabs */}

        <div className="sticky top-0 py-4 max-[600px]:mx-3 flex items-center max-w-sm mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center text-black border-r border-black/20">
              {/* active tab */}
              <div
                role="button"
                onClick={() => setIsOpenDropdown((prev) => !prev)}
                className="flex gap-x-0.5 items-center px-2 cursor-default select-none"
              >
                {activeTab} <IoIosArrowDown className="mt-1" size={16} />
              </div>
              {/* options */}
              {isOpenDropdown && (
                <div
                  ref={dropdownRef}
                  className={`absolute top-12 left-0 flex flex-col gap-x-0.5 items-center bg-white border border-black/20 rounded`}
                >
                  {mediaOptions.map((tab, index) => (
                    <div
                      key={tab}
                      className="cursor-pointer"
                      onClick={() => {
                        setActiveTab(tab as "image" | "video");
                        setIsOpenDropdown(false);
                      }}
                    >
                      <p className="px-4 py-1 ">{tab}</p>
                      {index !== mediaOptions.length - 1 && (
                        <hr className="border-black/20" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              value={searchQuery[activeTab]}
              onChange={(e) => {
                if (activeTab === "image") {
                  setSearchQuery({ image: e.target.value });
                }
                if (activeTab === "video") {
                  setSearchQuery({ video: e.target.value });
                }
              }}
              type="text"
              className="transition-all bg-white text-black text-sm rounded-lg block w-full p-2.5 ps-20 outline-none focus:ring-1 focus:ring-white"
              placeholder={
                activeTab === "image"
                  ? "Search for images"
                  : "Search for videos"
              }
            />
          </div>
        </div>

        <div className="overflow-y-scroll h-96">
          {/* image gallery */}
          {activeTab === "image" ? (
            <ImageGallery
              images={onlineImages}
              editorState={editorState}
              setEditorState={setEditorState}
              insertMedia={insertMedia}
              loading={loading}
            />
          ) : (
            <VideoGallery
              videos={onlineVideos}
              editorState={editorState}
              setEditorState={setEditorState}
              insertMedia={insertMedia}
              loading={loading}
            />
          )}
        </div>
        <div className="flex items-center justify-end">
          <Link href="https://www.pexels.com" target="_blank">
            <img
              className="w-20 mt-1 p-1"
              src="https://images.pexels.com/lib/api/pexels-white.png"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnlineImage;
