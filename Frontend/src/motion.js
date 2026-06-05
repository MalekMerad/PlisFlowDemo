export const sectionVariant = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring" } }
}

export const cardVariant = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: i => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.13, duration: 0.55, type: "spring" }
  })
}

export const mainImgVariant = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
}

export const speechVariant = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9 } }
}

export const serviceContentVariant = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.3 } }
};


