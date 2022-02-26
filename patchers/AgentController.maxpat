{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 2,
			"revision" : 1,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 34.0, 77.0, 1468.0, 713.0 ],
		"bglocked" : 0,
		"openinpresentation" : 0,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-3",
					"linecount" : 4,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 613.0, 13.5, 584.0, 62.0 ],
					"presentation_linecount" : 4,
					"text" : "MACHINE ACTIONS\n\n- While locked -> just listening the environment.\n- While released -> MOve around and change musical material"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"linecount" : 14,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 16.0, 13.5, 582.0, 200.0 ],
					"text" : "HUMAN INTERACTION\n\n1. Start with default track, this is the first agent.\n2. Play and record, don't allow to release agent until it has some recording.\n3. Release agent if needed.\n4. When realese it creates another track/agent and repeat from step 2.\n5. An agent can be catched, when it happens the current track is changed by the agent track, when this new agent is released, the previous new track will be available again.\n\nWHILE IN TRACK user can...\n\n- Move a hand to spatialize through mocap.\n- Catch and release by using the \"selection\" feature from HoloLens.\n- Play notes and move notes for controlling music and sound."
				}

			}
 ],
		"lines" : [  ],
		"dependency_cache" : [  ],
		"autosave" : 0
	}

}
