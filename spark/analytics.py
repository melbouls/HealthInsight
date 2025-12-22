from pyspark.sql import SparkSession
from pyspark.sql.functions import avg

spark = SparkSession.builder \
    .appName("HealthInsight") \
    .config("spark.mongodb.input.uri", "mongodb://mongo:27017/healthinsight.readings") \
    .config("spark.mongodb.output.uri", "mongodb://mongo:27017/healthinsight.daily_stats") \
    .getOrCreate()

try:
    # Utilisation du nom complet du connecteur pour éviter l'erreur "Source not found"
    df = spark.read.format("com.mongodb.spark.sql.DefaultSource").load()
    
    if df.count() > 0:
        stats = df.groupBy("type").agg(avg("value").alias("moyenne"))
        
        print("\n=== CALCUL DES MOYENNES REUSSI ===")
        stats.show()
        
        # Sauvegarde avec le nom complet du connecteur
        stats.write.format("com.mongodb.spark.sql.DefaultSource").mode("append").save()
        print("Données enregistrées dans la collection daily_stats.")
    else:
        print("La collection readings est vide. Insérez des données avec curl d'abord !")

except Exception as e:
    print(f"Erreur : {e}")

spark.stop()