export default class Loader {
  private loader: string[] = [];
  public loaderPush = (str: string) => {
    if (!this.loaderHas(str)) this.loader.push(str);
  };
  public loaderPop = (str: string) => {
    this.loader = this.loader.filter((e) => e != str);
  };
  public loaderHas = (str: string) => this.loader.includes(str);
}
