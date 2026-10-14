import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeSection } from '../../src/lib/active-section.ts';
const sections = [{href:'profile',top:800},{href:'experience',top:1800},{href:'toolbox',top:3600},{href:'projects',top:4800}];
test('no section is active before the profile',()=>assert.equal(activeSection(sections,400),null));
test('proof band retains the preceding profile section',()=>assert.equal(activeSection(sections,1600),'profile'));
test('section activates exactly at its boundary',()=>assert.equal(activeSection(sections,1800),'experience'));
test('the final section remains active after its content',()=>assert.equal(activeSection(sections,6000),'projects'));
test('empty pages have no active section',()=>assert.equal(activeSection([],320),null));
