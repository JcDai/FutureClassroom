// /*
//    This demo shows how you can put a texture map onto a cube
//    and also rotate the cube over time.
// */
// // export const init = async model => {
// //    let cube = model.add('cube').texture('media/textures/brick.png')
// //    model.move(0, 1.5, 0).scale(.3).animate(() => {
// //       cube.identity().turnZ(3 * model.time).turnX(model.time / 2);
// //       console.log(cube.getGlobalMatrix());
// //    });
// // }
// import { quat } from "../render/math/gl-matrix.js";

// export const init = async model => {
//    let zombies = model.add();
//    let zombie = zombies.add();
//    zombie.add('cube').color(1, 0, 0).scale(0.2);
//    zombie.add('cube').color(0, 1, 0).scale(0.25, 0.35, 0.25).move(0, -1.65, 0);
//    zombie.add('cube').color(0, 0, 1).scale(0.08, 0.08, 0.35).move(-4.5, -4.2, -1);
//    zombie.add('cube').color(0, 0, 1).scale(0.08, 0.08, 0.35).move(4.5, -4.2, -1);
//    zombie.add('cube').color(0, 0, 1).scale(0.1, 0.15, 0.1).move(2.4, -7.3, 0);
//    zombie.add('cube').color(0, 0, 1).scale(0.1, 0.15, 0.1).move(-2.4, -7.3, 0);

//    zombies.move(0, 1.5, 0);

//    let headset_position = window.avatars[window.playerid].headset.position;

//    console.log(window.avatars[window.playerid].headset.position);
//    console.log(window.avatars[window.playerid].headset.orientation);
//    console.log(window.avatars[window.playerid].headset.matrix);

//    let test_view = model.add('cube').scale(0.1).color(1, 0, 0);

//    model.animate(() => {
//       let headset_position = window.avatars[window.playerid].headset.position;
//       let headset_orientation = window.avatars[window.playerid].headset.orientation;
//       let headset_matrix = window.avatars[window.playerid].headset.matrix;
//       let ori_rotate = [0, 0, 0];
//       let z_offset = [0, 0, -1, 0];
//       let q = [headset_orientation['x'], headset_orientation['y'], headset_orientation['z'], headset_orientation['w']];
//       let q_inv = [0, 0, 0, 0];
//       quat.invert(q_inv, q);
//       z_offset = quat.multiply(z_offset, q, z_offset);
//       z_offset = quat.multiply(z_offset, z_offset, q_inv);

//       // console.log(z_offset);
//       // quat.getAxisAngle(ori_vec, [headset_orientation['x'], headset_orientation['y'], headset_orientation['z'], headset_orientation['w']]);
//       // quat.getEuler(ori_rotate, [headset_orientation['x'], headset_orientation['y'], headset_orientation['z'], headset_orientation['w']]);
//       // console.log(ori_vec);
//       // test_view.child(0).identity().turnX(-ori_rotate[0]).turnY(-ori_rotate[1]).turnZ(-ori_rotate[2]);
//       // console.log(ori_rotate);
//       // test_view.child(0).identity().turnY(ori_rotate[1]);

//       test_view.setMatrix(model.viewMatrix()).move(0, 0, -1).turnY(Math.PI);
//       // console.log(headset_position);
//       // console.log(headset_orientation);
//       // console.log(headset_matrix);
//    });
// }

import { lcb, rcb } from '../handle_scenes.js';

export const init = async model => {
   let isAnimate = 0, isItalic = 0, isClear = 0;
   model.control('a', 'animate', () => isAnimate = !isAnimate);
   model.control('c', 'clear', () => isClear = !isClear);
   model.control('i', 'italic', () => isItalic = !isItalic);

   let text = `Now is the time   \nfor all good men  \nto come to the aid\nof their party.   `.split('\n');

   let label = model.add();

   for (let line = 0; line < text.length; line++)
      label.add('label').move(0, -line, 0).scale(.5);

   model.animate(() => {
      label.setMatrix(model.viewMatrix()).move(0, 0, -5).turnY(Math.PI).scale(.1);
      label.flag('uTransparentTexture', isClear);
      for (let line = 0; line < text.length; line++) {
         let obj = label.child(line);
         obj.info((isItalic ? '<i>' : '') + text[line])
            .color(lcb.hitLabel(obj) ? [1, .5, .5] :
               rcb.hitLabel(obj) ? [.3, 1, 1] : [1, 1, 1]);
      }
   });
}