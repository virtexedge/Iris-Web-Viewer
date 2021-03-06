function io_import_stl(file, InputFileText) {

    // First get split the file line By Line
    var lines = InputFileText.split('\n');

    // Now check if it's a binary or ASCII file. ASCII files have 'solid' as the first
    // word in the first line of the file. If not, then it's safe to say it's binary.
    var isASCII = true;


    // First do an ASCII check
    // *****************************************************************************
    if (lines.length > 1) {
        var asciiCheck = lines[1].split(" ");

        if (asciiCheck[0] != "facet") {
            isASCII = false;
        }
    }
    // If the line length is less, then it's binary
    else {
        isASCII = false;
    }

    //log(asciiCheck);
    if (isASCII === false) {
        io_import_stl_binary(file, InputFileText);
    } else {

        var model = new vxModel(file);


        var mesh = new vxMesh("mesh: " + file.name.substring(0, file.name.length - 4));

        log("Loading file <b>'" + file.name + "'</b> as an <b>'ASCII .stl'</b> file...");

        /*******************************/
        //First initialise Arrarys
        /*******************************/

        var vertcount = 0;

        var vert1 = new vxVertex3D(0, 0, 0);
        var vert2 = new vxVertex3D(0, 0, 0);
        var vert3 = new vxVertex3D(0, 0, 0);
        var norm = new vxVertex3D(0, 0, 0);

        //Zero out the number of elements
        numOfElements = 0;
        var blockCount = 0;
        var TotalVertCount = 0;

        //Set the Index. 0 is the background.
        //numOfFaces = 1 + MeshCollection.length;

        var treeItems = [];

        var CreateNewBlock = false;
        var CanAddFace = false;

        //Re-zero out the model center
        modelprop_Center[0] = 0;
        modelprop_Center[1] = 0;
        modelprop_Center[2] = 0;

        mesh.IndexStart = numOfFaces;
        var finalline;

        for (var line = 0; line < lines.length; line++) {

            //First Split the Current Line into an Array split by spaces
            var inputLine = lines[line].split(" ");
            finalline = line;

            switch (inputLine[0]) {
                //Add Normal
                case "facet":

                    if (CanAddFace) {
                        // Once all of the data is in, create the new face
                        var selcol = new vxColour();
                        selcol.EncodeColour(numOfFaces);

                        mesh.AddFace(vert1, vert2, vert3, norm, norm, norm, new vxVertex2D(0, 0), new vxVertex2D(0, 0), new vxVertex2D(0, 0), meshcolor, selcol);
                        numOfFaces++;
                    }

                    inputLine[2] = parseFloat(inputLine[2]);
                    inputLine[3] = parseFloat(inputLine[3]);
                    inputLine[4] = parseFloat(inputLine[4]);
                    // Set the Normal for this Current Face
                    norm.Set(inputLine[2], inputLine[3], inputLine[4]);
                    break;


                    //Add Vertice point
                case "vertex":

                    inputLine[1] = parseFloat(inputLine[1]);
                    inputLine[2] = parseFloat(inputLine[2]);
                    inputLine[3] = parseFloat(inputLine[3]);

                    switch (vertcount) {
                        case 0:
                            vert1.Set(inputLine[1], inputLine[2], inputLine[3]);
                            break;
                        case 1:
                            vert2.Set(inputLine[1], inputLine[2], inputLine[3]);
                            break;
                        case 2:
                            vert3.Set(inputLine[1], inputLine[2], inputLine[3]);
                            break;
                    }
                    vertcount++;
                    if (vertcount > 2)
                        vertcount = 0;


                    // Set Model Center
                    modelprop_Center[0] -= inputLine[1];
                    modelprop_Center[1] -= inputLine[2];
                    modelprop_Center[2] -= inputLine[3];

                    //var vert = new vxVertex3D(inputLine[1], inputLine[2], inputLine[3]);

                    // Increment the 
                    numOfElements++;
                    TotalVertCount++;
                    CanAddFace = true;
                    break;
            }

        }

        // Add the last face
        var selcol = new vxColour();
        selcol.EncodeColour(numOfFaces);

        mesh.AddFace(vert1, vert2, vert3, norm, norm, norm, new vxVertex2D(0, 0), new vxVertex2D(0, 0), new vxVertex2D(0, 0), meshcolor, selcol);
        numOfFaces++;
        // Set the center
        modelprop_Center[0] /= TotalVertCount;
        modelprop_Center[1] /= TotalVertCount;
        modelprop_Center[2] /= TotalVertCount;

        model.AddMesh(mesh);

        InitialiseModel(model);

        // Now Set the View Parameters
        Camera.zoom = -model.MaxPoint.Length() * 1.5 - 1;
        Camera.rotX = -45;
        Camera.rotY = 30;

        log("Done!");
    }
}


function io_import_stl_binary(file, InputFileText) {
    log("Loading file <b>'" + file.name + "'</b> as an <b>'BINARY .stl'</b> file...");

    var model = new vxModel(file);
    model.fileInfo.format = "Binary";

    var mesh = new vxMesh("mesh: " + file.name.substring(0, file.name.length - 4));

    var vert1 = new vxVertex3D(0, 0, 0);
    var vert2 = new vxVertex3D(0, 0, 0);
    var vert3 = new vxVertex3D(0, 0, 0);
    var norm = new vxVertex3D(0, 0, 0);

    numOfElements = 0;
    var blockCount = 0;
    var TotalVertCount = 0;

    var binreader = new FileReader();
    //log(files[0]);
    //Function Executed After the File Has Been Loaded
    binreader.onload = function(e) {

        var buffer = e.target.result;

        // The stl binary is read into a DataView for processing
        var dv = new DataView(buffer, 80); // 80 == unused header
        var isLittleEndian = true;

        // Read a 32 bit unsigned integer
        var triangles = dv.getUint32(0, isLittleEndian);

        var offset = 4;
        for (var i = 0; i < triangles; i++) {
            // Get the normal for this triangle by reading 3 32 but floats
            //var normal = new THREE.Vector3(
            norm.Set(dv.getFloat32(offset, isLittleEndian),
                dv.getFloat32(offset + 4, isLittleEndian),
                dv.getFloat32(offset + 8, isLittleEndian)
            );
            //);
            offset += 12;

            // Get all 3 vertices for this triangle, each represented
            // by 3 32 bit floats.
            for (var j = 0; j < 3; j++) {

                numOfElements++;

                switch (j) {
                    case 0:
                        vert1.Set(dv.getFloat32(offset, isLittleEndian),
                            dv.getFloat32(offset + 4, isLittleEndian),
                            dv.getFloat32(offset + 8, isLittleEndian));
                        break;
                    case 1:
                        vert2.Set(dv.getFloat32(offset, isLittleEndian),
                            dv.getFloat32(offset + 4, isLittleEndian),
                            dv.getFloat32(offset + 8, isLittleEndian));
                        break;
                    case 2:
                        vert3.Set(dv.getFloat32(offset, isLittleEndian),
                            dv.getFloat32(offset + 4, isLittleEndian),
                            dv.getFloat32(offset + 8, isLittleEndian));
                        break;
                }
                offset += 12
            }

            // there's also a Uint16 "attribute byte count" that we
            // don't need, it should always be zero.
            offset += 2;

            // Once all of the data is in, create the new face
            var selcol = new vxColour();
            selcol.EncodeColour(numOfFaces);
            mesh.AddFace(vert1, vert2, vert3, norm, norm, norm, new vxVertex2D(0, 0), new vxVertex2D(0, 0), new vxVertex2D(0, 0), meshcolor, selcol);

            numOfFaces++;
        }



        model.AddMesh(mesh);

        InitialiseModel(model);

        // this needs to be called here since the Binary file is read later on.
        InitialiseFiles();

        // Now Set the View Parameters
        Zoom = -mesh.MaxPoint.Length() * 1.5 - 1;
        rotX = -45;
        rotY = 30;

    };

    // Read in the image file as a binary string.
    //binreader.readAsBinaryString(files[0]);
    binreader.readAsArrayBuffer(file);
}




function io_export_stl() {

    var fileWriter = new vxFileWriter("export.stl");

    // ASCII 'stl' file and face block format
    /*
      solid Exported from (exporter name)
      facet normal -1.000000 0.000000 0.000000
      outer loop
      vertex -1.000000 1.000000 -1.000000
      vertex -1.000000 -1.000000 -1.000000
      vertex -1.000000 -1.000000 1.000000
      endloop
      endfacet
    */

    // reclear the text
    stlText = "";

    var solidName = "Exported from " + iris.name + " - v. " + iris.version;

    // first add header line
    fileWriter.writeLine("solid " + solidName);

    // next loop through all faces in each model, mesh, and mesh part 
    for (var i = 0; i < ModelCollection.length; i++) {

        // loop through all models
        var model = ModelCollection[i];

        // loop through all meshes in the model
        for (var key in model.Meshes) {
            var mesh = model.Meshes[key];

            //loop through all mesh parts in the mesh
            for (var j = 0; j < mesh.MeshParts.length; j++) {
                var meshpart = mesh.MeshParts[j];


                // now loop through all of the indecies and faces for this mesh part
                for (var k = 0; k < meshpart.Indices.length; k += 3) {

                    // get the indicies for this face
                    var vi1 = [0, 0, 0];
                    for (var indx = 0; indx < 3; indx++)
                        vi1[indx] = meshpart.Indices[k + indx];

                    // average the normal for each 3 vertices
                    var ni1 = [0, 0, 0];
                    for (var indxNrml = 0; indxNrml < 3; indxNrml++) {
                        ni1[0] += parseFloat(meshpart.vert_noramls[vi1[indxNrml] * 3]);
                        ni1[1] += parseFloat(meshpart.vert_noramls[vi1[indxNrml] * 3 + 1]);
                        ni1[2] += parseFloat(meshpart.vert_noramls[vi1[indxNrml] * 3 + 2]);
                    }

                    ni1[0] /= 3;
                    ni1[1] /= 3;
                    ni1[2] /= 3;

                    // first write the normal
                    fileWriter.writeLine("facet normal " + ni1[0] + " " + ni1[1] + " " + ni1[2]);

                    // start the face loop
                    fileWriter.writeLine("outer loop");

                    // now write the vertex data
                    fileWriter.writeLine("vertex " + meshpart.mesh_vertices[vi1[0] * 3] + " " + meshpart.mesh_vertices[vi1[0] * 3 + 1] + " " + meshpart.mesh_vertices[vi1[0] * 3 + 2]);
                    fileWriter.writeLine("vertex " + meshpart.mesh_vertices[vi1[1] * 3] + " " + meshpart.mesh_vertices[vi1[1] * 3 + 1] + " " + meshpart.mesh_vertices[vi1[1] * 3 + 2]);
                    fileWriter.writeLine("vertex " + meshpart.mesh_vertices[vi1[2] * 3] + " " + meshpart.mesh_vertices[vi1[2] * 3 + 1] + " " + meshpart.mesh_vertices[vi1[2] * 3 + 2]);

                    // finish the face
                    fileWriter.writeLine("endloop");
                    fileWriter.writeLine("endfacet");
                }
            }
        }
    }
    // finish the file
    fileWriter.writeLine("endsolid " + solidName);
    fileWriter.save();

    return true;
}