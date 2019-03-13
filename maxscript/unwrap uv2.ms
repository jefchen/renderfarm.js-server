curObj = $Box001

bakeChannel_Obj = 2
flattenAngle = 45
flattenSpacing = 0.01
flattenRotate = true
flattenFillHoles = true

unwrapMod = unwrap_UVW()
					
unwrapMod.setAlwaysEdit false
unwrapMod.setMapChannel bakeChannel_Obj
unwrapMod.setFlattenAngle flattenAngle 
unwrapMod.setFlattenSpacing flattenSpacing 
unwrapMod.setFlattenNormalize true
unwrapMod.setFlattenRotate flattenRotate 
unwrapMod.setFlattenFillHoles flattenFillHoles 
unwrapMod.setApplyToWholeObject true
unwrapMod.name = "Flatten UV2"
unwrapMod.setDebugLevel 0

-- setAppData unwrapMod RTT_UnwrapMod_AppData_Index #object

-- add it to the object
-- add directly to the object to avoid groupness
addModifier curObj unwrapMod

-- & flatten things
unwrapMod.flattenMapByMatID \
    flattenAngle  \
    flattenSpacing  \
    true \
    2 \
    flattenRotate  \
    flattenFillHoles 
-- or use instead of true: autoUnwrapMappingProps.cNormalize.checked \