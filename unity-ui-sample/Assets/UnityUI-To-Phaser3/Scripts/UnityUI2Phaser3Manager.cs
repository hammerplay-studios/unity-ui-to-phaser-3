using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace Hammerplay.UnityUI2Phaser3 {

    public class UnityUI2Phaser3Manager : MonoBehaviour {

        [MenuItem ("Tools/UnityUI2Phaser3/Export to File %e")]
        private static void ExportToFile () {
            FindObjectOfType<UnityUI2Phaser3Manager>().GeneratePhaser3Data();
        }

        private UnityEngine.UI.CanvasScaler canvasScaler;

        private UnityUI2Phaser3Data unityUI2Phaser3Data;

        [SerializeField]
        private string exportPath;

        [ContextMenu("Generate PIXI data")]
        public void GeneratePhaser3Data() {
            unityUI2Phaser3Data = new UnityUI2Phaser3Data();
            unityUI2Phaser3Data.canvasScaler = new CanvasScaler(GetComponent<UnityEngine.UI.CanvasScaler>());

            var images = GetComponentsInChildren<UnityEngine.UI.Image>();
            List<UIImage> uiImages = new List<UIImage>();
            foreach (var image in images) {
                uiImages.Add(new UIImage(image));
            }
            unityUI2Phaser3Data.images = uiImages.ToArray();

            var texts = GetComponentsInChildren<UnityEngine.UI.Text>();
            List<UIText> uiTexts = new List<UIText>();
            foreach (var text in texts) {
                uiTexts.Add(new UIText(text));
            }

            unityUI2Phaser3Data.texts = uiTexts.ToArray();
            

            StreamWriter writer = new StreamWriter(exportPath, false);
            writer.WriteLine(JsonUtility.ToJson(unityUI2Phaser3Data));
            writer.Close();
        }  

        [System.Serializable]
        private class UnityUI2Phaser3Data {
            public CanvasScaler canvasScaler;
            public UIImage[] images;
            public UIText[] texts;
        }

        [System.Serializable]
        private class CanvasScaler {
            public Point referenceResolution;
            public float match;

            public CanvasScaler() {

            }

            public CanvasScaler(UnityEngine.UI.CanvasScaler canvasScaler) {
                referenceResolution.x = canvasScaler.referenceResolution.x;
                referenceResolution.y = canvasScaler.referenceResolution.y;
                match = canvasScaler.matchWidthOrHeight;
            }
        }

        private abstract class UIElement {
            public string name;
            
            public string parentName;

            public Point anchorMin;
            public Point anchorMax;
            public Point pivot;
            public Point anchoredPosition;

            public Point scaleFactor;
        }

        [System.Serializable]
        private class UIImage: UIElement {

            public string spriteName;
            public string tint;
            public float alpha;

            public UIImage() { }
            public UIImage(UnityEngine.UI.Image image) {
                parentName = image.transform.parent.name;
                name = image.transform.name;
                spriteName = image.sprite.name;
    
                anchorMin.x = image.rectTransform.anchorMin.x;
                anchorMin.y = 1 - image.rectTransform.anchorMin.y;
                anchorMax.x = image.rectTransform.anchorMax.x;
                anchorMax.y = 1- image.rectTransform.anchorMax.y;

                pivot.x = image.rectTransform.pivot.x;
                pivot.y = 1 - image.rectTransform.pivot.y;

                tint = ColorUtility.ToHtmlStringRGB(image.color);
                alpha = image.color.a;

                anchoredPosition.x = image.rectTransform.anchoredPosition.x;
                anchoredPosition.y = -image.rectTransform.anchoredPosition.y;

                scaleFactor.x = image.transform.localScale.x;
                scaleFactor.y = image.transform.localScale.y;
            }
        }

        [System.Serializable]
        private class UIText: UIElement {
            public string fontName;
            public int fontSize;
            public string align;
            public Point size;
            public string text;

            public string tint;
            public float alpha;

            public UIText() { }
            public UIText(UnityEngine.UI.Text text) {

                fontName = text.font.name;
                fontSize = text.fontSize;
                align = text.alignment.ToString ();
                this.text = text.text;
                this.size.x = text.rectTransform.sizeDelta.x;
                this.size.y = text.rectTransform.sizeDelta.y;

                parentName = text.transform.parent.name;
                name = text.transform.name;
                
                anchorMin.x = text.rectTransform.anchorMin.x;
                anchorMin.y = 1 - text.rectTransform.anchorMin.y;
                anchorMax.x = text.rectTransform.anchorMax.x;
                anchorMax.y = 1 - text.rectTransform.anchorMax.y;

                pivot.x = text.rectTransform.pivot.x;
                pivot.y = 1 - text.rectTransform.pivot.y;

                tint = ColorUtility.ToHtmlStringRGB(text.color);
                alpha = text.color.a;

                anchoredPosition.x = text.rectTransform.anchoredPosition.x;
                anchoredPosition.y = -text.rectTransform.anchoredPosition.y;

                scaleFactor.x = text.transform.localScale.x;
                scaleFactor.y = text.transform.localScale.y;
            }
        }

        [System.Serializable]
        private struct Point {
            public float x, y;
        }
    }
}