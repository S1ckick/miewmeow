/* global Miew:false */
(function() {


  var init_complex = document.currentScript.getAttribute('my_complex');
  var viewer = new Miew({
    container: document.getElementsByClassName('miew-container')[0],
  });
  if (viewer.init()) {
    viewer.run();
    if (init_complex !== "[]") {
      viewer.load(init_complex, {
        sourceType: "immediate",
        fileType: "pdb"
      });
    }
  }

  function CapsuleBufferGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength ) {

    THREE.BufferGeometry.call( this );

    this.type = 'CapsuleBufferGeometry';

    this.parameters = {
        radiusTop: radiusTop,
        radiusBottom: radiusBottom,
        height: height,
        radialSegments: radialSegments,
        heightSegments: heightSegments,
        thetaStart: thetaStart,
        thetaLength: thetaLength
    };

    var scope = this;

    radiusTop = radiusTop !== undefined ? radiusTop : 1;
    radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
    height = height !== undefined ? height : 2;

    radialSegments = Math.floor( radialSegments ) || 8;
    heightSegments = Math.floor( heightSegments ) || 1;
    capsTopSegments = Math.floor( capsTopSegments ) || 2;
    capsBottomSegments = Math.floor( capsBottomSegments ) || 2;

    thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
    thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI;

    // Alpha is the angle such that Math.PI/2 - alpha is the cone part angle.
    var alpha = Math.acos((radiusBottom-radiusTop)/height);
    var eqRadii = (radiusTop-radiusBottom === 0);

    var vertexCount = calculateVertexCount();
    var indexCount = calculateIndexCount();

    // buffers
    var indices = new THREE.BufferAttribute( new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount ), 1 );
    var vertices = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
    var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
    var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );

    // helper variables

    var index = 0,
        indexOffset = 0,
        indexArray = [],
        halfHeight = height / 2;

    // generate geometry

    generateTorso();

    // build geometry

    this.setIndex( indices );
    this.addAttribute( 'position', vertices );
    this.addAttribute( 'normal', normals );
    this.addAttribute( 'uv', uvs );

    // helper functions

    function calculateVertexCount(){
        var count = ( radialSegments + 1 ) * ( heightSegments + 1 + capsBottomSegments + capsTopSegments);
        return count;
    }

    function calculateIndexCount() {
        var count = radialSegments * (heightSegments + capsBottomSegments + capsTopSegments) * 2 * 3;
        return count;
    }

    function generateTorso() {

        var x, y;
        var normal = new THREE.Vector3();
        var vertex = new THREE.Vector3();

        var cosAlpha = Math.cos(alpha);
        var sinAlpha = Math.sin(alpha);

        var cone_length =
            new THREE.Vector2(
                radiusTop*sinAlpha,
                halfHeight+radiusTop*cosAlpha
                ).sub(new THREE.Vector2(
                    radiusBottom*sinAlpha,
                    -halfHeight+radiusBottom*cosAlpha
                )
            ).length();

        // Total length for v texture coord
        var vl = radiusTop*alpha
                 + cone_length
                 + radiusBottom*(Math.PI/2-alpha);

        var groupCount = 0;

        // generate vertices, normals and uvs

        var v = 0;
        for( y = 0; y <= capsTopSegments; y++ ) {

            var indexRow = [];

            var a = Math.PI/2 - alpha*(y / capsTopSegments);

            v += radiusTop*alpha/capsTopSegments;

            var cosA = Math.cos(a);
            var sinA = Math.sin(a);

            // calculate the radius of the current row
            var radius = cosA*radiusTop;

            for ( x = 0; x <= radialSegments; x ++ ) {

                var u = x / radialSegments;

                var theta = u * thetaLength + thetaStart;

                var sinTheta = Math.sin( theta );
                var cosTheta = Math.cos( theta );

                // vertex
                vertex.x = radius * sinTheta;
                vertex.y = halfHeight + sinA*radiusTop;
                vertex.z = radius * cosTheta;
                vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

                // normal
                normal.set( cosA*sinTheta, sinA, cosA*cosTheta );
                normals.setXYZ( index, normal.x, normal.y, normal.z );

                // uv
                uvs.setXY( index, u, 1 - v/vl );

                // save index of vertex in respective row
                indexRow.push( index );

                // increase index
                index ++;

            }

            // now save vertices of the row in our index array
            indexArray.push( indexRow );

        }

        var cone_height = height + cosAlpha*radiusTop - cosAlpha*radiusBottom;
        var slope = sinAlpha * ( radiusBottom - radiusTop ) / cone_height;
        for ( y = 1; y <= heightSegments; y++ ) {

            var indexRow = [];

            v += cone_length/heightSegments;

            // calculate the radius of the current row
            var radius = sinAlpha * ( y * ( radiusBottom - radiusTop ) / heightSegments + radiusTop);

            for ( x = 0; x <= radialSegments; x ++ ) {

                var u = x / radialSegments;

                var theta = u * thetaLength + thetaStart;

                var sinTheta = Math.sin( theta );
                var cosTheta = Math.cos( theta );

                // vertex
                vertex.x = radius * sinTheta;
                vertex.y = halfHeight + cosAlpha*radiusTop - y * cone_height / heightSegments;
                vertex.z = radius * cosTheta;
                vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

                // normal
                normal.set( sinTheta, slope, cosTheta ).normalize();
                normals.setXYZ( index, normal.x, normal.y, normal.z );

                // uv
                uvs.setXY( index, u, 1 - v/vl );

                // save index of vertex in respective row
                indexRow.push( index );

                // increase index
                index ++;

            }

            // now save vertices of the row in our index array
            indexArray.push( indexRow );

        }

        for( y = 1; y <= capsBottomSegments; y++ ) {

            var indexRow = [];

            var a = (Math.PI/2 - alpha) - (Math.PI - alpha)*( y / capsBottomSegments);

            v += radiusBottom*alpha/capsBottomSegments;

            var cosA = Math.cos(a);
            var sinA = Math.sin(a);

            // calculate the radius of the current row
            var radius = cosA*radiusBottom;

            for ( x = 0; x <= radialSegments; x ++ ) {

                var u = x / radialSegments;

                var theta = u * thetaLength + thetaStart;

                var sinTheta = Math.sin( theta );
                var cosTheta = Math.cos( theta );

                // vertex
                vertex.x = radius * sinTheta;
                vertex.y = -halfHeight + sinA*radiusBottom;;
                vertex.z = radius * cosTheta;
                vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

                // normal
                normal.set( cosA*sinTheta, sinA, cosA*cosTheta );
                normals.setXYZ( index, normal.x, normal.y, normal.z );

                // uv
                uvs.setXY( index, u, 1 - v/vl );

                // save index of vertex in respective row
                indexRow.push( index );

                // increase index
                index ++;

            }

            // now save vertices of the row in our index array
            indexArray.push( indexRow );

        }

        // generate indices

        for ( x = 0; x < radialSegments; x ++ ) {

            for ( y = 0; y < capsTopSegments + heightSegments + capsBottomSegments; y ++ ) {

                // we use the index array to access the correct indices
                var i1 = indexArray[ y ][ x ];
                var i2 = indexArray[ y + 1 ][ x ];
                var i3 = indexArray[ y + 1 ][ x + 1 ];
                var i4 = indexArray[ y ][ x + 1 ];

                // face one
                indices.setX( indexOffset, i1 ); indexOffset ++;
                indices.setX( indexOffset, i2 ); indexOffset ++;
                indices.setX( indexOffset, i4 ); indexOffset ++;

                // face two
                indices.setX( indexOffset, i2 ); indexOffset ++;
                indices.setX( indexOffset, i3 ); indexOffset ++;
                indices.setX( indexOffset, i4 ); indexOffset ++;

            }

        }

    }

}

CapsuleBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
CapsuleBufferGeometry.prototype.constructor = CapsuleBufferGeometry;

CapsuleBufferGeometry.fromPoints = function(pointA, pointB, radiusA, radiusB, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength ) {

    let cmin = null;
    let cmax = null;
    let rmin = null;
    let rmax = null;

    if(radiusA > radiusB){
        cmax = pointA;
        cmin = pointB;
        rmax = radiusA;
        rmin = radiusB;
    }else{
        cmax = pointA;
        cmin = pointB;
        rmax = radiusA;
        rmin = radiusB;
    }

    const c0 = cmin;
    const c1 = cmax;
    const r0 = rmin;
    const r1 = rmax;

    const sphereCenterTop = new THREE.Vector3( c0.x, c0.y, c0.z );
    const sphereCenterBottom = new THREE.Vector3( c1.x, c1.y, c1.z );

    const radiusTop = r0;
    const radiusBottom = r1;
    let height = sphereCenterTop.distanceTo( sphereCenterBottom );

    // If the big sphere contains the small one, return a SphereBufferGeometry
    if(height < Math.abs( r0 - r1 )){
        let g = new THREE.SphereBufferGeometry(r1, radialSegments, capsBottomSegments, thetaStart, thetaLength);
        g.translate(r1.x, r1.y, r1.z);
        return g;
    }

    // useful values
    const alpha = Math.acos( ( radiusBottom - radiusTop ) / height );
    const cosAlpha = Math.cos( alpha );
    const sinAlpha = Math.sin( alpha );

    // compute cylinder properties
    const coneHeight = height + cosAlpha * radiusTop - cosAlpha * radiusBottom;
    const cylTopRadius = sinAlpha * radiusTop;
    const cylBottomRadius = sinAlpha * radiusBottom;

    // compute rotation matrix
    const rotationMatrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const capsuleModelUnitVector = new THREE.Vector3( 0, 1, 0 );
    const capsuleUnitVector = new THREE.Vector3();
    capsuleUnitVector.subVectors( sphereCenterTop, sphereCenterBottom );
    capsuleUnitVector.normalize();
    quaternion.setFromUnitVectors( capsuleModelUnitVector, capsuleUnitVector );
    rotationMatrix.makeRotationFromQuaternion( quaternion );

    // compute translation matrix from center point
    const translationMatrix = new THREE.Matrix4();
    const cylVec = new THREE.Vector3();
    cylVec.subVectors( sphereCenterTop, sphereCenterBottom );
    cylVec.normalize();
    let cylTopPoint = new THREE.Vector3();
    cylTopPoint = sphereCenterTop;
    cylTopPoint.addScaledVector( cylVec, cosAlpha * radiusTop );
    let cylBottomPoint = new THREE.Vector3();
    cylBottomPoint = sphereCenterBottom;
    cylBottomPoint.addScaledVector( cylVec, cosAlpha * radiusBottom );

    // computing lerp for color
    const dir = new THREE.Vector3();
    dir.subVectors( cylBottomPoint, cylTopPoint );
    dir.normalize();

    const middlePoint = new THREE.Vector3();
    middlePoint.lerpVectors( cylBottomPoint, cylTopPoint, 0.5 );
    translationMatrix.makeTranslation( middlePoint.x, middlePoint.y, middlePoint.z );

    // Instanciate a CylinderBufferGeometry from three.js
    let g = new CapsuleBufferGeometry(radiusBottom, radiusTop, height, radialSegments, heightSegments, capsTopSegments, capsBottomSegments, thetaStart, thetaLength);

    // applying transformations
    g.applyMatrix( rotationMatrix );
    g.applyMatrix( translationMatrix );

    return g;
};

  

  function getCylinderBetweenPoints(point1, point2) {
    let HALF_PI = -Math.PI * .5;
    let diff = new THREE.Vector3().subVectors(point1, point2);
    let halfLength = diff.length() * .5;

    var cylinder = new CapsuleBufferGeometry(0.09,0.09,diff.length(),64,64,64,64);
    /*
    var cylinder = new THREE.CylinderBufferGeometry(
      0.09,
      0.09,
      diff.length(),
      50,
      30,
      false
    );
    */
    let orientation = new THREE.Matrix4();
    let offsetRotation = new THREE.Matrix4();
    let offsetPosition = new THREE.Matrix4();


    cylinder.applyMatrix4(new THREE.Matrix4().makeTranslation(0, diff.length() / 2, 0));
    cylinder.applyMatrix4(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(90)));

    cylinder.lookAt(diff);
    cylinder.translate(point1.x, point1.y, point1.z);
    return cylinder;
  }

  function createBond(idx1, idx2, isIndexes = true) {
    let pos1, pos2;
    if (isIndexes) {
      let atom1_pos =
        viewer._visuals["Dynamic pdb molecule"]._dataSource._atoms[idx1].position;
      let atom2_pos =
        viewer._visuals["Dynamic pdb molecule"]._dataSource._atoms[idx2].position;
      pos1 = new THREE.Vector3(atom1_pos.x, atom1_pos.y, atom1_pos.z);
      pos2 = new THREE.Vector3(atom2_pos.x, atom2_pos.y, atom2_pos.z);
    } else {
      pos1 = new THREE.Vector3(Number(idx1[0]), Number(idx1[1]), Number(idx1[2]));
      pos2 = new THREE.Vector3(Number(idx2[0]), Number(idx2[1]), Number(idx2[2]));
    }

    let vec = new THREE.Vector3().subVectors(pos1, pos2);
    const vecLen = vec.length();
    const k = 15;
    const chunk = vecLen / k;

    vec.multiplyScalar(1 / k);

    const group = new THREE.Group();
    let geometries = [];

    let curVec = new THREE.Vector3().copy(pos2);
    for (let i = 0; i < k; i++) {
      let prevVec = new THREE.Vector3().copy(curVec);
      curVec.addScaledVector(vec, 1);
      prevVec.addScaledVector(vec, 0.3);
      if (i%2 === 0){
      let cylinder = getCylinderBetweenPoints(prevVec, curVec);
      geometries.push(cylinder);
      }
    }
    return geometries;
  }

  function createBall(center) {
    let ball = new THREE.SphereBufferGeometry(0.25, 30, 30);
    ball.translate(center[0], center[1], center[2]);
    return ball;
  }

  let contacts_states = ["complex"];

  function renderContacts(contactName) {
    let xhr = new XMLHttpRequest();
    const parsedURL = new URL(window.location.href);
    const task_id = parsedURL.searchParams.get("task_id");
    const getter = document.getElementById(contactName + "_getter").checked ? "True" : "False";
    const halfURL = parsedURL.pathname.substring(0, parsedURL.pathname.lastIndexOf("/") + 1);
    
    xhr.open('GET', parsedURL.origin + halfURL + "/contacts?task_id=" + task_id + "&" + contactName + "=" + getter);
    xhr.send();
    if (getter === "True") {
      xhr.onload = function() {
        let interactions = JSON.parse(xhr.response);
        console.log(interactions);
        const group = new THREE.Group();
        const geoms = [];
        const interactions_type = Object.keys(interactions)[0];
        if (interactions[interactions_type].length > 0) {
          if (interactions_type == "hydrophobic") {
            let positions = interactions[interactions_type];
            for (let i = 0; i < positions.length; i++) {
              if (positions[i] != "") {
                let cylindersLine = createBond(Number(positions[i][0]) - 1, Number(positions[i][1]) - 1);
                for (let cyl in cylindersLine) {
                  geoms.push(cylindersLine[cyl]);
                }
              }
            }
          } else if (interactions_type == "pistacking") {
            let center1 = interactions[interactions_type][0];
            let center2 = interactions[interactions_type][1];
            let cylindersLine = createBond(center1, center2, false);
            for (let cyl in cylindersLine) {
              geoms.push(cylindersLine[cyl]);
            }
            let ball1 = createBall(center1);
            let ball2 = createBall(center2);
            geoms.push(ball1);
            geoms.push(ball2);
          }
        }


        let mol_color = contactName == "hydrophobic" ? 0x00ff17 : contactName == "pistacking" ? 0x389CFF : 0xD45D44;
        if (geoms.length > 0) {
          const mesh = new THREE.Mesh(
            THREE.BufferGeometryUtils.mergeBufferGeometries(geoms),
            new THREE.MeshPhongMaterial({
              color: mol_color,
              shininess: 100,
            }));
          group.add(mesh);
        }
        viewer._gfx.root.children[0].add(group);
        viewer._gfx.root.children[0].children[viewer._gfx.root.children.length - 1].position.copy(viewer._gfx.root.children[0].children[0].position);
        viewer._renderScene(viewer._gfx.camera, false);
        contacts_states.push(contactName);
          console.log(viewer._gfx.root);
      };
    } else {
      contact_idx = contacts_states.indexOf(contactName);
      if (contact_idx != -1) {
        viewer._gfx.root.children[0].children.splice(contacts_states.indexOf(contactName), 1);
        contacts_states.splice(contacts_states.indexOf(contactName), 1);
        viewer._renderScene(viewer._gfx.camera, false);
      }
    }
  };

  document.getElementById("hydrophobic_getter").addEventListener("change", function() {
    renderContacts("hydrophobic")
  });
  document.getElementById("pistacking_getter").addEventListener("change", function() {
    renderContacts("pistacking")
  });
    
  document.getElementById("display_mode_selector").addEventListener("change", function() {
    viewer.rep({
      mode: document.getElementById("display_mode_selector").value,
      colorer: 'HY',
    });
      
    if(document.getElementById("hydrophobic_getter").checked){
        renderContacts("hydrophobic");
    }
    if(document.getElementById("pistacking_getter").checked){
        renderContacts("pistacking");
    }
  });

}());