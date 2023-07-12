"use client";

import Modal from "@/components/Modal";
//A modal is a box that will disrupt a page by overlaying on top of it

import { useEffect, useState } from "react";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  //we dont want to render a modal if we are in server side rendering

  //if the useEffect loads, we are already on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //basically return null if we are in server side
  //otherwise we will add all our modals to be rendered
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Modal
        title="Test Modal"
        description="Test Description"
        isOpen
        onChange={() => {}}
      >
        {" "}
        Test Children
      </Modal>
    </>
  );
};

export default ModalProvider;
