import { __prod__ } from '@constants'
import _ from 'lodash'
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddPosts1660494342134 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        INSERT INTO page ("pageName", "fullPageName") VALUES ('osiggin0', 'Turcotte-Cronin');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tbasley1', 'Wolf-Price');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mbarthel2', 'Hagenes, Russel and Block');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('kduckinfield3', 'Koelpin, Rowe and O''Kon');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mmougeot4', 'Stroman-Lind');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('medden5', 'Wintheiser LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('astoney6', 'McGlynn, Hoppe and Little');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('cventam7', 'Corwin-Gerhold');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('cpragnall8', 'Fahey, Hayes and Predovic');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('gkissick9', 'Abbott Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dkedwella', 'Bode LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('osprostonb', 'Hartmann, Dibbert and Lang');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('snorkettc', 'Reinger LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tjurczikd', 'Hauck-Jones');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('fhoofee', 'Kiehn-Spinka');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('hgasperif', 'Reilly and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('lbennitg', 'Ziemann LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tclaireh', 'Hegmann-Wiza');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('vbutteli', 'Stracke LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('kmarchantj', 'Hermann and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('cdonoghuek', 'Runolfsdottir, Ziemann and Grady');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ojelksl', 'Schroeder, Smith and Wunsch');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jmallenderm', 'Macejkovic, Labadie and O''Kon');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tsiemonsn', 'Goldner LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('amethingamo', 'Champlin, Ruecker and Collier');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dleevesp', 'Feil LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jdoumerq', 'Larkin and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mkestenr', 'Donnelly and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('lpostins', 'Wisoky Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('avolkt', 'Thiel, Jacobson and Hermiston');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tbabinskiu', 'Johnston and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('csavilev', 'Rosenbaum LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('vmayesw', 'Jenkins Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ywillcockx', 'Satterfield and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dbulfieldy', 'Steuber-Kreiger');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tcottrillz', 'Fahey, Rowe and Champlin');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mlangthorne10', 'Rogahn and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('zparratt11', 'Schaden and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('edoucette12', 'Gulgowski, Paucek and Herman');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('gwillavize13', 'Crona, Effertz and King');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('rziemke14', 'Larkin-Walter');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tpickover15', 'Roob and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('awaghorn16', 'Cormier, Graham and Metz');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('lspruce17', 'Ebert-Bosco');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('sarmistead18', 'Cremin Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('odanick19', 'Harber Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dflipsen1a', 'Kirlin and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('pbygrave1b', 'Kessler, Kutch and Streich');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dbattabee1c', 'O''Conner, Stehr and Becker');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('abalfre1d', 'Beatty Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('elewer1e', 'Bogan, O''Connell and Klocko');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('hmclaine1f', 'Zemlak-Stiedemann');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mbevan1g', 'Borer, McKenzie and Mueller');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('leldon1h', 'Heller, Johnson and Kuvalis');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('gthunnercliff1i', 'Adams Inc');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('scrowhurst1j', 'Boyle, Gaylord and Flatley');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mgilloran1k', 'Mosciski and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('cbertholin1l', 'Hodkiewicz-Wolf');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ecastiglione1m', 'Kshlerin, Hills and Jacobs');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('sgearty1n', 'Mertz Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('bpatesel1o', 'Yundt and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('vhoudmont1p', 'Stanton-Jacobs');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('cpikhno1q', 'Shanahan, Lueilwitz and Wolf');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('lpaute1r', 'Kiehn, Emard and Lemke');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('rabramchik1s', 'Smith LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('csommerville1t', 'Crooks-Monahan');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jjaume1u', 'Leuschke LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('alethbury1v', 'Howe, Hand and Jerde');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('gdoogood1w', 'Howe-Streich');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ldrabble1x', 'Balistreri-Greenfelder');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('pudie1y', 'Wisozk Inc');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('econiam1z', 'Legros, Weimann and Stiedemann');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('pkipping20', 'Braun, Hessel and Blick');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mcaccavella21', 'Skiles-Douglas');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jbelhomme22', 'Schoen, Rice and Cassin');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('dsikora23', 'Swift, Glover and Jerde');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('gnorewood24', 'O''Kon and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jscowcraft25', 'Cronin, Leffler and Spencer');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('wjeffreys26', 'Ritchie Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('amaccoughen27', 'Hickle, Price and Bergstrom');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('oseywood28', 'Bailey Group');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('kdennison29', 'Hettinger LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('etzuker2a', 'McKenzie Inc');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mguidoni2b', 'Bailey-Hartmann');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('etaaffe2c', 'Halvorson, Pagac and Jones');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('bglynne2d', 'Kessler Inc');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('jmatejovsky2e', 'Blick, Greenholt and Nader');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ftilio2f', 'Nitzsche, Auer and Kemmer');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('skhadir2g', 'Beier-Osinski');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('blanktree2h', 'Luettgen LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('htofts2i', 'Pagac, Kuhlman and Ernser');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ccrisford2j', 'Pollich LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('vwinterflood2k', 'Reichel LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('mdominey2l', 'Hahn-Green');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ngrave2m', 'Farrell LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('ttoomey2n', 'Yost-Reichel');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tdog2o', 'Johnston LLC');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('aseabon2p', 'Goyette and Sons');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('tlutsch2q', 'Cassin-Gottlieb');
        INSERT INTO page ("pageName", "fullPageName") VALUES ('lwickardt2r', 'Marvin, Hand and McCullough');

        INSERT INTO page_owners_user ("pageId", "userId") VALUES (1, 61);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (2, 84);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (3, 56);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (4, 73);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (5, 17);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (6, 43);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (7, 56);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (8, 81);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (9, 23);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (10, 96);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (11, 71);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (12, 16);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (13, 86);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (14, 74);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (15, 44);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (16, 56);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (17, 49);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (18, 71);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (19, 29);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (20, 48);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (21, 53);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (22, 11);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (23, 60);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (24, 22);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (25, 80);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (26, 54);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (27, 95);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (28, 41);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (29, 19);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (30, 31);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (31, 39);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (32, 14);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (33, 40);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (34, 8);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (35, 36);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (36, 21);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (37, 46);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (38, 29);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (39, 79);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (40, 91);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (41, 41);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (42, 86);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (43, 46);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (44, 94);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (45, 5);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (46, 51);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (47, 63);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (48, 26);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (49, 24);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (50, 6);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (51, 27);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (52, 32);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (53, 94);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (54, 4);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (55, 3);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (56, 77);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (57, 62);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (58, 95);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (59, 49);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (60, 65);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (61, 14);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (62, 70);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (63, 73);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (64, 23);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (65, 26);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (66, 8);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (67, 35);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (68, 30);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (69, 41);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (70, 20);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (71, 44);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (72, 76);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (73, 43);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (74, 90);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (75, 35);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (76, 77);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (77, 52);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (78, 84);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (79, 7);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (80, 28);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (81, 22);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (82, 90);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (83, 92);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (84, 58);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (85, 18);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (86, 6);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (87, 36);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (88, 19);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (89, 62);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (90, 3);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (91, 19);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (92, 16);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (93, 95);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (94, 73);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (95, 34);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (96, 39);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (97, 27);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (98, 93);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (99, 49);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (100, 88);

        INSERT INTO page_owners_user ("pageId", "userId") VALUES (1, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (2, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (3, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (4, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (5, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (6, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (7, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (8, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (9, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (10, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (11, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (12, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (13, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (14, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (15, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (16, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (17, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (18, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (19, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (20, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (21, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (22, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (23, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (24, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (25, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (26, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (27, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (28, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (29, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (30, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (31, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (32, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (33, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (34, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (35, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (36, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (37, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (38, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (39, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (40, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (41, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (42, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (43, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (44, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (45, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (46, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (47, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (48, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (49, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (50, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (51, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (52, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (53, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (54, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (55, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (56, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (57, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (58, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (59, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (60, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (61, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (62, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (63, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (64, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (65, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (66, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (67, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (68, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (69, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (70, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (71, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (72, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (73, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (74, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (75, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (76, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (77, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (78, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (79, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (80, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (81, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (82, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (83, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (84, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (85, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (86, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (87, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (88, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (89, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (90, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (91, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (92, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (93, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (94, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (95, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (96, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (97, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (98, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (99, 1);
        INSERT INTO page_owners_user ("pageId", "userId") VALUES (100, 1);
      `)

      for (let i = 1; i <= 100; i++) {                // for each page
        let queryString = ''
        const numberOfFollowers = _.random(1, 100)
        // Generate an array of unique random integers (min 2, max 101) with length equal to numberOfFollowers
        const arr = _.sampleSize(_.range(2, 102), numberOfFollowers)
        for (let y = 0; y < arr.length; y++) { // a page can have a maximum of 100 followers
          queryString += `\nINSERT INTO page_follow ("pageId", "userId") VALUES (${i}, ${arr[y]});`
        }
        await queryRunner.query(queryString)
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`--sql
        DELETE FROM page WHERE true;
        DELETE FROM page_owners_user WHERE true;
        DELETE FROM page_follow WHERE true;
      `)
    }
  }

}
