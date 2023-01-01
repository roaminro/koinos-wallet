export default function initiPolyfills() {
  if (!('randomUUID' in crypto)) {
    // https://stackoverflow.com/a/2117523/2800218
    // LICENSE: https://creativecommons.org/licenses/by-sa/4.0/legalcode
    //@ts-ignore
    crypto.randomUUID = function randomUUID() {
      return (
        //@ts-ignore
        [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
          (c: number) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
  }
}