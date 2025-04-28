onmessage = (e) => {
    const { file } = e.data;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => postMessage({ base64: reader.result });
    reader.onerror = (error) => postMessage({ error });
  };