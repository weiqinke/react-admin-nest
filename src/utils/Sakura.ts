import { getRandom } from "./core";

export const Sakura: any = function (img: any, x: any, y: any, s: any, r: any, fn: any) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.s = s;
  this.r = r;
  this.fn = fn;
};

Sakura.prototype.draw = function (cxt: any) {
  cxt.save();
  cxt.translate(this.x, this.y);
  cxt.rotate(this.r);
  cxt.drawImage(this.img, 0, 0, 40 * this.s, 40 * this.s);
  cxt.restore();
};

Sakura.prototype.update = function () {
  this.x = this.fn.x(this.x, this.y);
  this.y = this.fn.y(this.y, this.y);
  this.r = this.fn.r(this.r);

  const clientHeight = document.body.clientHeight;
  const clientWidth = document.body.clientWidth;
  if (this.x > clientWidth || this.x < 0 || this.y > clientHeight || this.y < 0) {
    this.r = getRandom("fnr");
    if (Math.random() > 0.4) {
      this.x = getRandom("x");
      this.y = 0;
      this.s = getRandom("s");
      this.r = getRandom("r");
    } else {
      this.x = clientWidth;
      this.y = getRandom("y");
      this.s = getRandom("s");
      this.r = getRandom("r");
    }
  }
};

export const SakuraList: any = function () {
  this.list = [];
};
SakuraList.prototype.push = function (sakura: any) {
  this.list.push(sakura);
};
SakuraList.prototype.update = function () {
  for (let i = 0, len = this.list.length; i < len; i++) {
    this.list[i].update();
  }
};
SakuraList.prototype.draw = function (cxt: any) {
  for (let i = 0, len = this.list.length; i < len; i++) {
    this.list[i].draw(cxt);
  }
};
SakuraList.prototype.get = function (i: any) {
  return this.list[i];
};
SakuraList.prototype.size = function () {
  return this.list.length;
};
