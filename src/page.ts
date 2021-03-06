﻿/// <reference path="questionbase.ts" />
/// <reference path="questionfactory.ts" />
/// <reference path="jsonobject.ts" />

module Survey {
    export class PageModel extends Base implements IPage {
        questions: Array<QuestionBase> = new Array<QuestionBase>();
        public data: ISurvey = null;

        public title: string = "";
        public visibleIndex: number = -1;
        private numValue: number = -1;
        private visibleValue: boolean = true;
        constructor(public name: string = "") {
            super();
            var self = this;
            this.questions.push = function (value) {
                if (self.data != null) {
                    value.setData(self.data);
                }
                return Array.prototype.push.call(this, value);
            };
        }
        public get processedTitle() { return this.data != null ? this.data.processText(this.title) : this.title; }
        public get num() { return this.numValue; }
        public set num(value: number) {
            if (this.numValue == value) return;
            this.numValue = value;
            this.onNumChanged(value);
        }
        public get visible(): boolean { return this.visibleValue; }
        public set visible(value: boolean) {
            if (value === this.visible) return;
            this.visibleValue = value;
            if (this.data != null) {
                this.data.pageVisibilityChanged(this, this.visible);
            }
        }
        public getType(): string { return "page"; }
        public get isVisible(): boolean {
            if (!this.visible) return false;
            for (var i = 0; i < this.questions.length; i++) {
                if (this.questions[i].visible) return true;
            }
            return false;
        }

        public addQuestion(question: QuestionBase, index: number = -1) {
            if (question == null) return;
            if (index < 0 || index >= this.questions.length) {
                this.questions.push(question);
            } else {
                this.questions.splice(index, 0, question);
            }
            if (this.data != null) {
                question.setData(this.data);
                this.data.questionAdded(question, index);
            }
        }
        public addNewQuestion(questionType: string, name: string): QuestionBase {
            var question = QuestionFactory.Instance.createQuestion(questionType, name);
            this.addQuestion(question);
            return question;
        }
        public removeQuestion(question: QuestionBase) {
            var index = this.questions.indexOf(question);
            if (index < 0) return;
            this.questions.splice(index, 1);
            if (this.data != null) this.data.questionRemoved(question);
        }
        public hasErrors(focuseOnFirstError: boolean = false): boolean {
            var result = false;
            var firstErrorQuestion = null;
            for (var i = 0; i < this.questions.length; i++) {
                if (this.questions[i].visible && this.questions[i].hasErrors()) {
                    if (focuseOnFirstError && firstErrorQuestion == null) {
                        firstErrorQuestion = this.questions[i];
                    }
                    result = true;
                }
            }
            if (firstErrorQuestion) firstErrorQuestion.focus();
            return result;
        }
        public addQuestionsToList(list: Array<IQuestion>, visibleOnly: boolean = false) {
            if (visibleOnly && !this.visible) return;
            for (var i: number = 0; i < this.questions.length; i++) {
                if (visibleOnly && !this.questions[i].visible) continue;
                list.push(this.questions[i]);
            }
        }
        protected onNumChanged(value: number) {
        }
    }
    JsonObject.metaData.addClass("page", ["name", "questions", "visible:boolean", "title"], function () { return new PageModel(); });
    JsonObject.metaData.setPropertyValues("page", "visible", null, true);
    JsonObject.metaData.setPropertyClassInfo("page", "questions", "question");
 }