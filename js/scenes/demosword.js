/*
   This demo shows a way to incorporate GLTF models that were
   previously created in external modeling programs.
*/
import * as global from "../global.js";
import { Avatar } from "../primitive/avatar.js";
import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as cg from "../render/core/cg.js";
import { quat } from "../render/math/gl-matrix.js";

export const init = async model => {
   //gui
   let hp = 30;
   let score = 0;
   let win_bar = 15;
   let score_text = "Score: ";
   let hp_text = "HP: "

   let hp_label = model.add('label');
   let score_label = model.add('label');
   let game_over_label = model.add('label');
   let win_label = model.add('label');
   let bullet_label = model.add('label');


   //zombies
   let zombie_init_num = 3;
   let zombie_speed = 0.5;
   let zombies = model.add();
   zombies.move(0, 1.4, 0);

   let zombie_status = [];

   for (let i = 0; i < zombie_init_num; i++) {
      let zombie = zombies.add().add();
      zombie.add('cube').scale(0.2).texture('media/textures/zombie_texture.png');
      zombie.add('cube').scale(0.25, 0.5, 0.25).move(0, -1.65, 0).texture('media/textures/pink.jpeg');
      zombie.add('cube').color(1, 0, 1).scale(0.08, 0.08, 0.35).move(-4.5, -5, -1);
      zombie.add('cube').color(1, 0, 1).scale(0.08, 0.08, 0.35).move(4.5, -5, -1);
      zombie.add('cube').color(1, 0, 1).scale(0.1, 0.4, 0.1).move(2.4, -4.5, 0);
      zombie.add('cube').color(1, 0, 1).scale(0.1, 0.4, 0.1).move(-2.4, -4.5, 0);
      zombie_status.push(true);

      //random generate place
      let randx = Math.random() * 2 + 3;
      let randz = Math.random() * 2 + 3;
      let signx = Math.random() > 0.5 ? 1 : -1;
      let signz = Math.random() > 0.5 ? 1 : -1;
      zombies.child(i).move(signx * randx, 0, signz * randz).scale(0.6);

   }

   let zombie_interval = 4;

   //first layer child translation, second layer child rotataion
   // zombies.child(0).move(0, 0, 3).scale(0.6);
   // zombies.child(1).move(1, 0, 1).scale(0.6);


   //sword
   let sword = model.add();
   sword.add('cube').color(1, 0, 0).move(.02, 0, 0).scale(.02, .005, .005);
   sword.add('cube').color(0, 0, 1).move(0, .02, 0).scale(.005, .02, .005);
   sword.add('tubeZ').color(0, 1, 0).move(0, 0, -0.5).scale(.01, .01, 0.5);

   //gun
   let gun = model.add();
   gun.add('cube').color(1, 0, 0).move(.02, 0, 0).scale(.02, .005, .005);
   gun.add('cube').color(0, 0, 1).move(0, .02, 0).scale(.005, .02, .005);
   gun.add('tubeZ').turnX(-0.785).color(0, 1, 1).move(0, 0, -0.1).scale(.01, .01, 0.1);


   //audios
   let shoot_audio = new Audio("../../media/sound/shoot.mp3");
   let empty_audio = new Audio("../../media/sound/empty.mp3");
   let reload_audio = new Audio("../../media/sound/reload.mp3");
   let bullet_hit_audio = new Audio("../../media/sound/bulletkill.mp3");
   let sword_hit_audio = new Audio("../../media/sound/swordkill.m4a");
   let zombie_hit_audio = new Audio("../../media/sound/zombieeat.mp3");
   let win_audio = new Audio("../../media/sound/winning.mp3");
   let game_over_audio = new Audio("../../media/sound/gameover.mp3");

   win_audio.load();
   game_over_audio.load();

   let win_played = false;
   let game_over_played = false;

   let bgm = new Audio("../../media/sound/pvz2.mp3");
   // gun_audio.load();
   // hit_audio.load();

   //bullets
   let bullets = model.add();
   let bullet_interval = 0.6;
   let bullet_num = 0;
   let reload = 6;
   let reload_interval = 3;

   // let status_board = model.add();
   // status_board.add('cube').color(0, 1, 0).scale(0.2, 0.2, 0.01);
   // let status_on = false;
   // let status_interval = 0.2;
   // let status_cube = model.add('cube').move(0, 1.2, 0.2).color(0, 1, 0).scale(0.15);
   bgm.load();
   bgm.play();


   model.animate(() => {

      //gui 
      score_label.setMatrix(model.viewMatrix()).move(-0.4, 0.1, -1).turnY(Math.PI).scale(.05);
      score_label.info(score_text + score);
      hp_label.setMatrix(model.viewMatrix()).move(-0.4, 0, -1).turnY(Math.PI).scale(.05);
      hp_label.info(hp_text + hp);
      bullet_label.setMatrix(model.viewMatrix()).move(0.4, 0, -1).turnY(Math.PI).scale(.05);
      bullet_label.info(reload + "/6");

      if (hp <= 0) {
         // game_over_audio.load();
         if (!game_over_played) {
            game_over_audio.play();
            game_over_played = true;
         }

         game_over_label.setMatrix(model.viewMatrix()).move(0, -0.3, -0.8).turnY(Math.PI).scale(.1);
         game_over_label.info("GAME OVER");

      }

      if (score >= win_bar) {
         // win_audio.load();
         if (!win_played) {
            win_audio.play();
            win_played = true;
         }

         win_label.setMatrix(model.viewMatrix()).move(0, -0.3, -0.8).turnY(Math.PI).scale(.1);
         win_label.info("YOU WIN");
      }

      if (score < win_bar && hp > 0) {

         //generate new zombie
         zombie_interval += model.deltaTime;
         if (zombie_interval >= 1.5) {
            zombie_interval = 0;
            let zombie = zombies.add().add();
            zombie.add('cube').scale(0.2).texture('media/textures/zombie_texture.png');
            // zombie.add('cube').color(0, 1, 0).scale(0.25, 0.5, 0.25).move(0, -1.65, 0);
            zombie.add('cube').scale(0.25, 0.5, 0.25).move(0, -1.65, 0).texture('media/textures/pink.jpeg');
            zombie.add('cube').color(1, 0, 1).scale(0.08, 0.08, 0.35).move(-4.5, -5, -1);
            zombie.add('cube').color(1, 0, 1).scale(0.08, 0.08, 0.35).move(4.5, -5, -1);
            zombie.add('cube').color(1, 0, 1).scale(0.1, 0.4, 0.1).move(2.4, -4.5, 0);
            zombie.add('cube').color(1, 0, 1).scale(0.1, 0.4, 0.1).move(-2.4, -4.5, 0);
            zombie_status.push(true);

            //random generate place
            let randx = Math.random() * 2 + 3;
            let randz = Math.random() * 2 + 3;
            let signx = Math.random() > 0.5 ? 1 : -1;
            let signz = Math.random() > 0.5 ? 1 : -1;
            zombies.child(zombies.nChildren() - 1).move(signx * randx, 0, signz * randz).scale(0.6);
         }


         //sword and gun
         let right_cont_matrix = controllerMatrix.right;
         let left_cont_matrix = controllerMatrix.left;
         let RM = right_cont_matrix.length ? cg.mMultiply(right_cont_matrix, cg.mTranslate(-.001, 0, 0)) : cg.mTranslate(0.2, 1.5, 1);
         let LM = left_cont_matrix.length ? cg.mMultiply(left_cont_matrix, cg.mTranslate(.006, 0, 0)) : cg.mTranslate(-0.2, 1.5, 1);
         sword.setMatrix(RM);
         gun.setMatrix(LM);

         //bullets
         bullet_interval += model.deltaTime;
         reload_interval += model.deltaTime;
         let leftTrigger = buttonState.left[0].pressed;
         let X = buttonState.left[4].pressed;
         if (leftTrigger && bullet_interval >= 0.6 && reload_interval >= 3) {

            if (reload > 0) {
               let bul = bullets.add();
               bul.add('cube').scale(0.01).color(1, 0, 1);
               bul.setMatrix(LM);

               bullet_interval = 0;
               bullet_num++;
               reload--;
               shoot_audio.load();
               shoot_audio.play();
            }
            else {
               //play no bullet audio
               empty_audio.load();
               empty_audio.play();

            }
         }

         if (X && reload_interval >= 3) {
            reload_interval = 0;
            reload = 6;
            reload_audio.load();
            reload_audio.play();
            //play reload audio
         }



         let bullet_speed = 200;

         for (let i = 0; i < bullet_num; i++) {
            bullets.child(i).child(0).move(0, -bullet_speed * model.deltaTime, -bullet_speed * model.deltaTime);
         }

         //zombies
         for (let i = 0; i < zombies.nChildren(); i++) {

            if (!zombie_status[i]) continue;

            // zombie params
            let headset_position = window.avatars[window.playerid].headset.position;
            let headset_pos = [headset_position['x'], 0, headset_position['z']];
            let zombie_position = zombies.child(i).getGlobalMatrix();
            let zombie_pos = [zombie_position[12], zombie_position[13], zombie_position[14]];
            let move_toward = [headset_pos[0] - zombie_pos[0], 0, headset_pos[2] - zombie_pos[2]]
            let move_norm = Math.sqrt(move_toward[0] * move_toward[0] + move_toward[1] * move_toward[1] + move_toward[2] * move_toward[2]);
            move_toward = [move_toward[0] / move_norm, move_toward[1] / move_norm, move_toward[2] / move_norm];
            let rad = Math.asin(move_toward[0]);

            //zombie on body
            if (move_norm < 0.2) {
               zombies.child(i).move(0, -100, 0).scale(0.0001);
               hp--;
               zombie_status[i] = false;
               zombie_hit_audio.load();
               zombie_hit_audio.play();
            }

            //sword on zombie
            if (cg.mHitRect(RM, zombies.child(i).child(0).child(0).getGlobalMatrix()) || cg.mHitRect(RM, zombies.child(i).child(0).child(1).getGlobalMatrix())) {
               zombies.child(i).move(0, -100, 0).scale(0.0001);
               score++;
               zombie_status[i] = false;
               sword_hit_audio.load();
               sword_hit_audio.play();
               // hit_audio.load();
            }

            //bullet on zombie (headshot only)
            for (let j = 0; j < bullet_num; j++) {
               // if (bz_distance < 0.05) {
               if (cg.mHitRect(bullets.child(j).child(0).getGlobalMatrix(), zombies.child(i).child(0).child(0).getGlobalMatrix())) {
                  // objs.child(i).color(1, 0, 0);
                  zombies.child(i).move(0, 100, 0).scale(0.0001);
                  bullets.child(j).move(0, -100, 0).scale(0.0001);
                  score++;
                  zombie_status[i] = false;
                  bullet_hit_audio.load();
                  bullet_hit_audio.play();
                  // hit_audio.load();
               }
            }

            //zombie move
            if (move_toward[2] > 0) {
               zombies.child(i).child(0).identity().turnY(Math.PI + rad);
            }
            else {
               zombies.child(i).child(0).identity().turnY(-rad);
            }

            zombies.child(i).move(zombie_speed * model.deltaTime * move_toward[0], 0, zombie_speed * model.deltaTime * move_toward[2]);
         }
      }




   });

}

