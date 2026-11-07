function initRange(v1, v2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(v1);
      break;
    default:
      this.range(v2).domain(v1);
      break;
  }
  return this;
}
export { initRange as i };