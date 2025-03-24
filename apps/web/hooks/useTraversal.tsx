"use client"

function useTraversal(element: any, traverse: string, levels: number = 1) {
  let currentElement = element;
  for (let i = 0; i < levels; i++) {
    if (currentElement[traverse]) {
      currentElement = currentElement[traverse];
    } else {
      break;
    }
  }
  return currentElement;
}

export default useTraversal;
